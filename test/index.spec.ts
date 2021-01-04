import OpenMetrics, { MetricsConfig } from '../src/index';

import { Logger } from '@verdaccio/types';

// @ts-ignore
const config: MetricsConfig = {
  enabled: true
};

const logger: Logger = {
  error: e => console.warn(e),
  info: e => console.warn(e),
  debug: e => console.warn(e),
  child: e => console.warn(e),
  warn: e => {},
  http: e => console.warn(e),
  trace: e => console.warn(e)
};

describe('OpenMetrics plugin', () => {
  test('should test plugin', () => {
    // @ts-ignore
    const plugin = new OpenMetrics(config, { logger, config: undefined });
    expect(plugin).toBeDefined();
    expect(plugin.server).toBeTruthy();
    plugin.server.close();
  });

  test('should test plugin with configuration', () => {
    // @ts-ignore
    const config: MetricsConfig = { metrics_on_main: true };
    const plugin = new OpenMetrics(config, { logger, config: config });
    expect(plugin).toBeDefined();
    expect(plugin.server).toBeFalsy();
  });
});
