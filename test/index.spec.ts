import { Logger } from '@verdaccio/types';

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
  test('should test plugin', () => {
    const plugin = new OpenMetrics(config, { logger, config });

    expect(plugin).toBeDefined();
    expect(plugin.server).toBeTruthy();

    plugin.server.close(); // stop http listener
  });

  test('should test plugin with configuration', () => {
    const plugin = new OpenMetrics({ ...config, metrics_on_main: true }, { logger, config });

    expect(plugin).toBeDefined();
    expect(plugin.server).toBeFalsy();
  });
});
