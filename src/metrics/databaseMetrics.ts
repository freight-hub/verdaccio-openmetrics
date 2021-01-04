import { IStorageManager, Version } from '@verdaccio/types';
import { Registry, Gauge } from 'prom-client';

import { MetricsConfig } from '../types';

export function collectDatabaseMetrics(storage: IStorageManager<MetricsConfig>, registry: Registry): () => void {
  // TODO: add more metrics for the local database

  const packageVersionsName = 'database_package_versions_count';
  const packageVersions = new Gauge({
    name: packageVersionsName,
    help: 'number of local package versions in local database',
    registers: [registry],
  });

  function reportDatabaseGauges(): void {
    storage.getLocalDatabase(function(err: unknown, packages: Version[]) {
      if (err) {
        packageVersions.reset();
      } else {
        packageVersions.set(packages.length);
      }
    });
  }

  setTimeout(reportDatabaseGauges, 500);
  const timer = setInterval(reportDatabaseGauges, 60 * 60 * 1000); // hourly
  return (): void => clearInterval(timer);
}
