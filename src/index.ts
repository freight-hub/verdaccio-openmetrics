import { Logger, IPluginMiddleware, IBasicAuth, IStorageManager, PluginOptions } from '@verdaccio/types';
import { Application } from 'express';
import { Server, startMetricsServer } from './metricsServer';
import * as MetricCollectors from './metrics/index';

import { MetricsConfig } from '../types/index';

export default class VerdaccioMiddlewarePlugin implements IPluginMiddleware<MetricsConfig> {
  public logger: Logger;
  public server: Server;
  public constructor(private config: MetricsConfig, options: PluginOptions<MetricsConfig>) {
    this.server = startMetricsServer({
      port: config.metrics_port,
      defaultLabels: config.default_labels,
    })
    this.logger = options.logger;
  }

  public register_middlewares(
    app: Application,
    /* eslint @typescript-eslint/no-unused-vars: off */
    auth: IBasicAuth<MetricsConfig>,
    _storage: IStorageManager<MetricsConfig>
  ): void {

    if (this.config.collect_database) {
      MetricCollectors.collectDatabaseMetrics(_storage);
    }

    if (this.config.collect_http != false) {
      app.use(MetricCollectors.setupRequestInterceptor());
    }

    if (this.config.collect_runtime) {
      MetricCollectors.collectRuntimeMetrics();
    }

    if (this.config.collect_up) {
      MetricCollectors.collectUpMetrics();
    }

  }
}
