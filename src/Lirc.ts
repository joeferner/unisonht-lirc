import { RouteHandlerRequest, RouteHandlerResponse, UnisonHT, UnisonHTPlugin } from '@unisonht/unisonht';
import { LircClientWrapper } from './LircClientWrapper';
import { LircClientWrapperMock } from './LircClientWrapperMock';
import { LircClientWrapperImpl } from './LircClientWrapperImpl';
import Debug from 'debug';

const debug = Debug('lirc');

export interface LircButton {
  remote: string;
  button: string;
}

export interface LircOptions {
  useMockClient?: boolean;
  path?: string;
  toLirc?: (key: string) => LircButton;
  fromLirc?: (remote: string, button: string) => string;
}

const DEFAULT_OPTIONS = {
  useMockClient: false,
  path: '/var/run/lirc/lircd',
};

export class Lirc implements UnisonHTPlugin {
  private readonly lircClient: LircClientWrapper;
  private readonly options: LircOptions;
  private unisonht: UnisonHT | undefined;

  constructor(name: string, options?: LircOptions) {
    this.options = {
      ...DEFAULT_OPTIONS,
      ...(options || {}),
    };
    this.lircClient = this.options.useMockClient
      ? new LircClientWrapperMock()
      : new LircClientWrapperImpl(this.options.path || DEFAULT_OPTIONS.path);
    this.lircClient.on('receive', async (remote: string, button: string, repeat: number) => {
      try {
        if (this.options.fromLirc) {
          const key = this.options.fromLirc(remote, button);
          if (this.unisonht) {
            await this.unisonht.executePost(`/key/${key}`);
          } else {
            debug('received message from lirc but unisonht not setup');
          }
        } else {
          debug('received message from lirc but "fromLirc" not defined');
        }
      } catch (err) {
        debug(`failed to receive: ${err}`);
      }
    });
  }

  public async initialize(unisonht: UnisonHT): Promise<void> {
    debug('connecting to LIRC');
    this.unisonht = unisonht;
    await this.lircClient.start();
  }

  public async handleKeyPress(
    key: string,
    request: RouteHandlerRequest,
    response: RouteHandlerResponse,
    next: (err?: Error) => void,
  ): Promise<void> {
    if (this.options.toLirc) {
      const { remote, button } = this.options.toLirc(key);
      await this.lircClient.sendOnce(remote, button);
    } else {
      next();
    }
  }
}
