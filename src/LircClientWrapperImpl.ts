import lircClient, { LircClient } from 'lirc-client';
import { LircClientWrapper } from './LircClientWrapper';
import Debug from 'debug';
import events from 'events';

const debug = Debug('lirc:ClientWrapperImpl');

export class LircClientWrapperImpl extends events.EventEmitter implements LircClientWrapper {
    private lirc: LircClient | undefined;
    private path: string;

    constructor(path: string) {
        super();
        this.path = path;
    }

    public start(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            try {
                this.lirc = lircClient({
                    path: this.path,
                });
            } catch (err) {
                reject(err);
                return;
            }

            this.lirc.on('connect', () => {
                debug('connect');
                resolve();
            });

            this.lirc.on('error', (message: string) => {
                debug(`lirc error ${message}`);
                this.stop();
                reject(new Error(message));
            });

            this.lirc.on('receive', (remote: string, button: string, repeat: string) => {
                debug(`receive: ${remote}, ${button}, ${repeat}`);
                this.emit('receive', remote, button, parseInt(repeat, 10));
            });

            this.lirc.on('disconnect', () => {
                debug('disconnect');
            });
        });
    }

    public async stop(): Promise<void> {
        if (this.lirc) {
            this.lirc.disconnect();
        }
        this.lirc = undefined;
    }

    public async sendOnce(remote: string, button: string, repeat?: number): Promise<void> {
        if (this.lirc) {
            debug(`sendOnce(remote: ${remote}, button: ${button}, repeat: ${repeat})`);
            this.lirc.sendOnce(remote, button, repeat);
        } else {
            debug('send once called without lirc initialized');
        }
    }
}
