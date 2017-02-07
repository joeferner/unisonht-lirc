import lircClient = require("lirc-client");
import * as Logger from "bunyan";
import {createLogger} from "../unisonht/lib/Log";
import {LircClient, ReceiveHandler} from "./LircClient";

export class LircClientImpl implements LircClient {
  private lirc;
  private log: Logger;
  private path: string;

  constructor(path: string) {
    this.log = createLogger('LircClient');
    this.path = path;
  }

  start(onReceive: ReceiveHandler): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.lirc = lircClient({
        path: this.path
      });

      this.lirc.on('connect', () => {
        resolve();
      });

      this.lirc.on('error', (message) => {
        this.log.error(`${message}`);
        this.stop();
        reject(new Error(message));
      });

      this.lirc.on('receive', (remote: string, button: string, repeat: number) => {
        this.log.debug(`receive: ${remote}, ${button}, ${repeat}`);
        onReceive(remote, button, repeat);
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
}