import { Server } from 'http';

import { Logger } from '@verdaccio/types';
import express from 'express';
import fetch from 'node-fetch';

import OpenMetrics, { MetricsConfig } from '../src/index';

// There's a bunch of other unrelated fields so we have to cast this
const config: MetricsConfig = ({
  enabled: true,
} as unknown) as MetricsConfig;

const logger: Logger = {
  error: e => console.warn(e),
  info: e => console.warn(e),
  debug: e => console.warn(e),
  child: e => console.warn(e),
  warn: e => console.warn(e),
  http: e => console.warn(e),
  trace: e => console.warn(e),
};

describe('OpenMetrics plugin', () => {
  test('should work without configuration', async () => {
    const plugin = new OpenMetrics(config, { logger, config });
    expect(plugin).toBeDefined();

    const app = express();
    plugin.register_middlewares(app, null, null);

    expect(plugin.server).toBeTruthy();
    await plugin.ready;

    const resp = await fetch('http://localhost:9090/metrics');
    const text = await resp.text();
    expect(resp.status).toBe(200);
    expect(text).toContain('# TYPE http_request_duration_seconds');

    plugin.close(); // stop http listener
  });

  test('should reject unknown paths', async () => {
    const plugin = new OpenMetrics(config, { logger, config });
    expect(plugin).toBeDefined();

    const app = express();
    plugin.register_middlewares(app, null, null);

    expect(plugin.server).toBeTruthy();
    await plugin.ready;

    const resp = await fetch('http://localhost:9090/asdf');
    expect(resp.status).toBe(404);

    plugin.close(); // stop http listener
  });

  test('should capture http metrics', async () => {
    const plugin = new OpenMetrics(config, { logger, config });
    expect(plugin).toBeDefined();

    const app = express();
    plugin.register_middlewares(app, null, null);

    const server = await new Promise<Server>(ok => {
      const srv = app.listen(() => ok(srv));
    });
    const srvAddr = server.address();
    const { port } = typeof srvAddr === 'object' ? srvAddr : { port: -1 };

    expect(plugin.server).toBeTruthy();
    await plugin.ready;

    // file some "API" traffic
    const resp1 = await fetch(`http://localhost:${port}/-/metrics`);
    expect(resp1.status).toBe(404);
    const resp2 = await fetch(`http://localhost:${port}/`);
    expect(resp2.status).toBe(404);

    // check metrics
    const resp = await fetch('http://localhost:9090/metrics');
    const text = await resp.text();
    expect(resp.status).toBe(200);
    expect(text).toContain('{status_code="404",method="GET"} 2');

    server.close();
    plugin.close(); // stop http listener
  });

  test('should allow metrics on main server', async () => {
    const plugin = new OpenMetrics({ ...config, metrics_on_main: true, collect_up: true }, { logger, config });

    expect(plugin).toBeDefined();
    expect(plugin.server).toBeFalsy();

    const app = express();
    plugin.register_middlewares(app, null, null);

    const server = await new Promise<Server>(ok => {
      const srv = app.listen(() => ok(srv));
    });
    const srvAddr = server.address();
    const { port } = typeof srvAddr === 'object' ? srvAddr : { port: -1 };

    const resp = await fetch(`http://localhost:${port}/-/metrics`);
    const text = await resp.text();
    expect(resp.status).toBe(200);
    expect(text).toContain('# TYPE up gauge\nup 1');

    server.close();
  });

  test('should offer additional opt-in metrics', async () => {
    const plugin = new OpenMetrics(
      {
        ...config,
        collect_http: false,
        collect_up: true,
        collect_database: true,
        collect_runtime: true,
        default_labels: { env: 'prod' },
      },
      { logger, config }
    );
    expect(plugin).toBeDefined();

    const app = express();
    plugin.register_middlewares(app, null, null);

    expect(plugin.server).toBeTruthy();
    await plugin.ready;

    const resp = await fetch('http://localhost:9090/metrics');
    const text = await resp.text();
    expect(resp.status).toBe(200);
    expect(text).toContain('up{env="prod"} 1');

    plugin.close(); // stop http listener
  });

  test('should crash on reentry', async () => {
    const plugin = new OpenMetrics(config, { logger, config });
    expect(plugin).toBeDefined();

    const app = express();
    plugin.register_middlewares(app, null, null);

    expect(plugin.server).toBeTruthy();
    await plugin.ready;

    expect(() => {
      plugin.server.listen();
    }).toThrow('Already listening');

    plugin.close(); // stop http listener
  });
});
