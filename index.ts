import {UnisonHT, Plugin, Input} from "unisonht";
import lircClient = require("lirc-client");

export class Lirc extends Input {
  private lirc;

  constructor(name: string, options?: Lirc.Options) {
    super(name, options || {});
    this.getOptions().path = this.getOptions().path || '/var/run/lirc/lircd';
  }

  start(unisonht: UnisonHT): Promise<void> {
    this.log.debug('connecting to LIRC');
    return new Promise<void>((resolve, reject) => {
      this.lirc = lircClient({
        path: this.getOptions().path
      });

      this.lirc.on('connect', () => {
        resolve();
      });

      this.lirc.on('error', (message) => {
        this.log.error(`${message}`);
        this.stop();
        reject(new Error(message));
      });

      this.lirc.on('receive', (remote, button, repeat) => {
        this.log.debug(`receive: ${remote}, ${button}, ${repeat}`);
        unisonht.currentModeButtonPress(button)
          .catch((err) => {
            this.log.error('invalid key press: ', err);
          })
      });

      this.lirc.on('disconnect', () => {
        this.log.debug('disconnect');
      });
    });
  }

  stop(): Promise<void> {
    this.lirc.close();
    this.lirc = null;
    return Promise.resolve();
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
