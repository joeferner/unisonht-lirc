import {UnisonHT, Plugin, Input} from "unisonht";
import {LircClient} from "./LircClient";
import {MockLircClient} from "./MockLircClient";
import {LircClientImpl} from "./LircClientImpl";

export class Lirc extends Input {
  private lircClient: LircClient;

  constructor(name: string, options?: Lirc.Options) {
    super(name, options || {});
    this.lircClient =
      process.env.NODE_ENV === 'development'
        ? new MockLircClient()
        : new LircClientImpl(options.path || '/var/run/lirc/lircd');
  }

  start(unisonht: UnisonHT): Promise<void> {
    this.log.debug('connecting to LIRC');
    return this.lircClient.start((remote: string, button: string, repeat: number) => {
      unisonht.currentModeButtonPress(button)
        .catch((err) => {
          this.log.error('invalid key press: ', err);
        });
    });
  }

  stop(): Promise<void> {
    return this.lircClient.stop();
  }

  protected getOptions(): Lirc.Options {
    return <Lirc.Options>super.getOptions();
  }
}

export module Lirc {
  export interface Options extends Input.Options {
    path?: string
  }
}
