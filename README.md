# verdaccio-openmetrics

> Exposes an OpenMetrics/Prometheus endpoint with health and traffic metrics

This plugin, when installed and loaded,
  serves Prometheus/OpenMetrics metrics at the path `/metrics`.
This can then be scraped by your Prometheus installation, Datadog agent, etc.

A second HTTP port is used to keep metrics internal to your infrastructure more easily.
The default metrics port is 9090.

The primary metrics exposed are HTTP response latencies by request method and response status code.
There's also an option to collect NodeJS runtime metrics
  (the defaults from the `prom-client` package).
A further option will be to infrequently collect statistics about the database,
  however it's not clear yet what will be interesting to expose there.

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
