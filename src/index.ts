import { Logger, IPluginMiddleware, IBasicAuth, IStorageManager, PluginOptions } from '@verdaccio/types';
import { Application } from 'express';
import { Registry } from 'prom-client';

import { MetricsConfig } from './types/index';
import { MetricsServer } from './metricsServer';
import { createMetricsRoute } from './metricsRoute';
import * as MetricCollectors from './metrics/index';

export { MetricsConfig };

export default class VerdaccioOpenmetricsPlugin implements IPluginMiddleware<MetricsConfig> {
  public logger: Logger;
  public server?: MetricsServer;
  public registry = new Registry();
  public constructor(private config: MetricsConfig, options: PluginOptions<MetricsConfig>) {
    if (config.default_labels) {
      this.registry.setDefaultLabels(config.default_labels);
    }
    this.logger = options.logger;

    // Allow disabling the secondary listener
    // Still enable exposing both by specifying both options
    if (!config.metrics_on_main || config.metrics_port) {
      this.server = new MetricsServer(this.registry);
      this.server.listen(config.metrics_port);
    }
  }

  public register_middlewares(
    app: Application,
    auth: IBasicAuth<MetricsConfig>,
    _storage: IStorageManager<MetricsConfig>
  ): void {
    // Optionally expose metrics on the main API surface
    if (this.config.metrics_on_main) {
      app.use('/-/metrics', createMetricsRoute(this.registry));
    }

    // The different metrics we can collect:

    if (this.config.collect_database) {
      MetricCollectors.collectDatabaseMetrics(_storage, this.registry);
    }

    if (this.config.collect_http != false) {
      app.use(MetricCollectors.setupRequestInterceptor(this.registry));
    }

    if (this.config.collect_runtime) {
      MetricCollectors.collectRuntimeMetrics({ register: this.registry });
    }

    if (this.config.collect_up) {
      MetricCollectors.collectUpMetrics(this.registry);
    }
  }
}
