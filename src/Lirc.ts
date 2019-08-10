import {
  RouteHandlerRequest,
  RouteHandlerResponse,
  SupportedButtons,
  UnisonHT,
  UnisonHTPlugin,
} from '@unisonht/unisonht';
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
  toLirc?: (button: string) => LircButton;
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
    this.lircClient.on('receive', async (remote: string, lircButton: string, repeat: number) => {
      try {
        if (this.options.fromLirc) {
          const button = this.options.fromLirc(remote, lircButton);
          if (this.unisonht) {
            const url = `/button/${button}`;
            try {
              await this.unisonht.executePost(url);
            } catch (err) {
              console.error(`failed to execute post: ${url}`, err);
            }
          } else {
            debug('received message from lirc but unisonht not setup');
          }
        } else {
          debug('received message from lirc but "fromLirc" not defined');
        }
      } catch (err) {
        console.error('failed to process receive', err);
      }
    });
  }

  public async initialize(unisonht: UnisonHT): Promise<void> {
    debug('connecting to LIRC');
    this.unisonht = unisonht;
    await this.lircClient.start();
  }

  public async handleButtonPress(
    button: string,
    request: RouteHandlerRequest,
    response: RouteHandlerResponse,
    next: (err?: Error) => void,
  ): Promise<void> {
    if (this.options.toLirc) {
      const { remote, button: lircButton } = this.options.toLirc(button);
      await this.lircClient.sendOnce(remote, lircButton);
    } else {
      next();
    }
  }

  public getSupportedButtons(): SupportedButtons {
    return {};
  }
}
