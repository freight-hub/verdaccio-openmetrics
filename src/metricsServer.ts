import { createServer, IncomingMessage, ServerResponse } from 'http';
import { AddressInfo, Server } from 'net';

import { Registry } from 'prom-client';

export class MetricsServer {
  public constructor(public registry: Registry) {
    this.httpServer = createServer(this.responseHandler.bind(this));
  }
  private httpServer: Server;

  public listen(port = 9090): Promise<number> {
    if (this.httpServer.listening) {
      throw new Error(`Already listening`);
    }
    return new Promise<void>((ok) => this.httpServer.listen(port, ok)).then(
      () => (this.httpServer.address() as AddressInfo).port
    );
  }
  public close(): void {
    this.httpServer.close();
  }

  public async responseHandler(req: IncomingMessage, res: ServerResponse): Promise<void> {
    if (req.url === '/metrics') {
      res.setHeader('content-type', this.registry.contentType);
      res.end(await this.registry.metrics());
      return;
    }

    res.statusCode = 404;
    res.end();
  }
}
