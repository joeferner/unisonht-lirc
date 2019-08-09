import {LircClientWrapper} from "./LircClientWrapper";
import Debug from 'debug';
import events from "events";

const debug = Debug('lirc:ClientWrapperMock');

export class LircClientWrapperMock extends events.EventEmitter implements LircClientWrapper {
    async start(): Promise<void> {
        debug('lirc start');
    }

    async stop(): Promise<void> {
        debug('lirc stop');
    }

    async sendOnce(remote: string, button: string, repeat?: number): Promise<void> {
        debug(`sendOnce(remote: ${remote}, button: ${button}, repeat: ${repeat})`);
    }
}
