import UnisonHT from "unisonht";
import {Input, InputOptions} from "unisonht/lib/Input";
const lircClient = require("lirc-client");
import createLogger from "unisonht/lib/Log";
const log = createLogger('lirc');

interface LircOptions extends InputOptions {
  path?: string
}

export default class Lirc extends Input {
  private lirc;
  private options: LircOptions;

  constructor(options: LircOptions) {
    super(options);
    this.options = options;
    this.options.path = this.options.path || '/var/run/lirc/lircd';
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
            log.error('invalid key press', err);
          })
      });

      this.lirc.on('disconnect', ()=> {
        log.debug('disconnect');
      });
    });
  }

  stop(unisonHT: UnisonHT): Promise<void> {
    this.lirc.close();
    this.lirc = null;
    return Promise.resolve();
  }
}
