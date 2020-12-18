import { Config } from '@verdaccio/types';

export interface MetricsConfig extends Config {
  metrics_port?: number;
  default_labels?: Record<string, string>;

  collect_http?: boolean;
  collect_database?: boolean;
  collect_up?: boolean;
  collect_runtime?: boolean;
}
