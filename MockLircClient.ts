import {LircClient, ReceiveHandler} from "./LircClient";

export class MockLircClient implements LircClient {
  start(onReceive: ReceiveHandler): Promise<void> {
    console.log('lirc start');
    return Promise.resolve();
  }

  stop(): Promise<void> {
    console.log('lirc stop');
    return Promise.resolve();
  }
}
