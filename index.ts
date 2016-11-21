import {UnisonHT, UnisonHTInput} from "unisonht";
import createLogger from "unisonht/lib/Log";
import lircClient = require("lirc-client");
const log = createLogger('lirc');

export default class Lirc implements UnisonHTInput {
  private lirc;
  private options: Lirc.Options;

  constructor(options: Lirc.Options) {
    this.options = options;
    this.options.path = this.options.path || '/var/run/lirc/lircd';
  }

  getName(): string {
    return this.options.name;
  }

  start(unisonHT: UnisonHT): Promise<void> {
    log.debug('connecting to LIRC');
    return new Promise((resolve, reject)=> {
      this.lirc = lircClient({
        path: this.options.path
      });

      this.lirc.on('connect', () => {
        if (resolve) {
          resolve();
        }
        resolve = null;
        reject = null;
      });

      this.lirc.on('error', (message)=> {
        log.error('error: %s', message);
        if (reject) {
          reject();
        }
        resolve = null;
        reject = null;
      });

      this.lirc.on('receive', (remote, button, repeat) => {
        log.debug('receive: %s, %s, %s', remote, button, repeat);
        unisonHT.processInput({
          remote: remote,
          button: button,
          repeat: repeat
        })
          .catch((err)=> {
            log.error('invalid key press: ', err);
          })
      });

      this.lirc.on('disconnect', ()=> {
        log.debug('disconnect');
      });
    });
  }

  stop(): Promise<void> {
    this.lirc.close();
    this.lirc = null;
    return Promise.resolve();
  }
}

module Lirc {
  export interface Options {
    name: string
    path?: string
  }
}