import { register, Registry } from 'prom-client'
import { createServer, IncomingMessage, Server, ServerResponse } from 'http'
import { AddressInfo } from 'net'

export class MetricsServer {
  constructor(
    public registry: Registry,
  ) {}
  public httpServer = createServer(this.responseHandler.bind(this));

  async listen(port = 9090) {
    if (this.httpServer.listening) throw new Error(`Already listening`);
    await new Promise<void>(ok => this.httpServer.listen(port, ok));
    return (this.httpServer.address() as AddressInfo).port;
  }
  close() {
    if (!this.httpServer) return;
    this.httpServer.close();
  }

  async responseHandler(req: IncomingMessage, res: ServerResponse) {
    if (req.url === '/metrics') {
      res.setHeader('content-type', this.registry.contentType);
      res.end(await this.registry.metrics());
      return;
    }

    res.statusCode = 404;
    res.end();
  }
}
