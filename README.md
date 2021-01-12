# @freighthub/verdaccio-openmetrics

> Verdaccio plugin exposing an OpenMetrics/Prometheus endpoint with health and traffic metrics

This plugin, when installed and loaded,
  serves Prometheus/OpenMetrics metrics at a known path.
This can then be scraped by your Prometheus installation, Datadog agent, etc.

By default, a second HTTP listener is used
  to keep metrics internal to your infrastructure more easily.
The default metrics port is 9090.
So, metrics will be available at `:9090/metrics`.

If you instead want to have your metrics available via Verdaccio's main API,
set `metrics_on_main: true` and access `/-/metrics` on Verdaccio.
This will disable the second HTTP listener unless you also pass `metrics_port` explicitly.

The primary metrics exposed are HTTP response latencies by request method and response status code.
There's also an option to collect NodeJS runtime metrics
  (the defaults from the `prom-client` package).
A further option will be to infrequently collect statistics about the database,
  however it's not clear yet what will be interesting to expose there.

## plugin name

Note that this Verdaccio plugin is published within a package scope.
To load the plugin from a Verdaccio config, specify the full name:

```yaml
middlewares:
  '@freighthub/verdaccio-openmetrics':
    enabled: true
```

This works around the automatic `verdaccio-` prefix that Verdaccio expects.

## config

If no extra config is given, HTTP request metrics will be exposed at `:9090/metrics`.

If you want additional metrics, for example runtime and database metrics:

```yaml
middlewares:
  '@freighthub/verdaccio-openmetrics':
    enabled: true
    collect_runtime: true
    collect_database: true
```

All config keys and default values:

```typescript
interface MetricsConfig {
  metrics_port: 9090; // Exposes metrics at /metrics on this alternate port
  metrics_on_main: false; // Exposes metrics at /-/metrics on Verdaccio
  default_labels: {}; // key/value tags attached to every metric

  collect_http: true; // Latency metrics for Verdaccio's API, by method and status code
  collect_database: false; // WIP metrics about Verdaccio's database, updated infrequently
  collect_up: false; // a fixed gauge of '1'
  collect_runtime: false; // the default Prometheus metrics for NodeJS processes
}
```

---

## development

See the [verdaccio contributing guide](https://github.com/verdaccio/verdaccio/blob/master/CONTRIBUTING.md) for instructions setting up your development environment.
Note that `yarn` is being used in place of `npm` in this plugin.
Once you have completed that, use the following yarn tasks.

  - `yarn build`

    Build a distributable archive

  - `yarn test`

    Run unit test

For more information about any of these commands run `yarn ${task} -- --help`.
