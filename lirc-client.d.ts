declare module "lirc-client" {
  interface LircClientOptions {
    path: string
  }

  function lircClient(options: LircClientOptions): any;

  export = lircClient;
}