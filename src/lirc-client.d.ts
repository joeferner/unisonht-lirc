declare module 'lirc-client' {
    export interface LircClientOptions {
        autoconnect?: boolean;
        host?: string;
        port?: number;
        path?: string;
        reconnect?: boolean;
        reconnect_delay?: number;
    }

    export interface LircClient {
        send(command: string, ...args: string[]): Promise<string[]>;

        sendOnce(remote: string, button: string, repeat?: number): Promise<string[]>;

        sendStart(remote: string, button: string): Promise<string[]>;

        sendStop(remote: string, button: string): Promise<string[]>;

        list(remote?: string): Promise<string[]>;

        version(): Promise<string[]>;

        connect(): Promise<void>;

        disconnect(): Promise<void>;

        on(event: 'connect', listener: () => void): this;

        on(event: 'disconnect', listener: () => void): this;

        on(event: 'error', listener: (err: string) => void): this;

        on(event: 'receive', listener: (remote: string, button: string, repeat: string) => void): this;

        on(event: 'rawdata', listener: (data: Buffer | string) => void): this;

        on(event: 'message', listener: (data: any | null, payload: any) => void): this;
    }

    export default function lircClient(options: LircClientOptions): LircClient;
}
