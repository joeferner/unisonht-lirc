export interface ReceiveHandler {
  (remote: string, button: string, repeat: number): any;
}

export interface LircClient {
  start(onReceive: ReceiveHandler): Promise<void>;
  stop(): Promise<void>;
}