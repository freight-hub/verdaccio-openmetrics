import { IStorageManager, Version } from "@verdaccio/types";
import { Registry, Gauge } from "prom-client";

import { MetricsConfig } from "../../types";

export function collectDatabaseMetrics(
  storage: IStorageManager<MetricsConfig>,
  registry: Registry,
) {

  // TODO: add more metrics for the local database

  const packageVersionsName = 'database_package_versions_count';
  const packageVersions = new Gauge({
    name: packageVersionsName,
    help: 'number of local package versions in local database',
    registers: [registry],
  });

  function reportDatabaseGauges() {
    storage.getLocalDatabase(function (err: any, packages: Version[]) {
      packageVersions.set(packages.length);
    });
  }

  setTimeout(reportDatabaseGauges, 5000);
  setInterval(reportDatabaseGauges, 60*60*1000); // hourly
}
