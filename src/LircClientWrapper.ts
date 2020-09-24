import EventEmitter = NodeJS.EventEmitter;

export interface LircClientWrapper extends EventEmitter {
    start(): Promise<void>;

    stop(): Promise<void>;

    sendOnce(remote: string, button: string, repeat?: number): Promise<void>;

    on(event: 'receive', listener: (remote: string, button: string, repeat: number) => void): this;
}
