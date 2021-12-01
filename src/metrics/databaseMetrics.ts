import { promisify } from 'util';

import { IStorageManager, IPluginStorage, ReadPackageCallback, Package } from '@verdaccio/types';
import { Registry, Gauge } from 'prom-client';

import { MetricsConfig } from '../types';

// This is much like getLocalDatabase except:
// 1) it returns the full payloads instead of removing useful info on versions
//    (needed to report total # of known versions in local database)
// 2) it's a proper async generator instead of messy bulk-result callback soup
// Original getLocalDatabase function here:
// https://github.com/verdaccio/verdaccio/blob/93468211d6ec64e2f9612b1a83410bd712a51471/src/lib/storage.ts#L423
async function* iterateLocalDatabase(
  storage: IStorageManager<MetricsConfig>
): AsyncGenerator<Package, undefined, undefined> {
  // Try getting the backing store directly, which isn't in the shared type definitions
  const storagePlugin = (storage as { localStorage?: { storagePlugin?: IPluginStorage<MetricsConfig> } }).localStorage
    ?.storagePlugin;
  // Ok to just bail quietly if we can't figure this out
  if (!storagePlugin) {
    throw new Error(`No storage plugin found on storage manager`);
  }

  // promisify/wrap the loader funcs
  const getPkgList = promisify(storagePlugin.get.bind(storagePlugin)) as () => Promise<Array<string>>;
  const getPkgMetadata = promisify((name: string, cb: ReadPackageCallback) => {
    const storage = storagePlugin.getPackageStorage(name);
    if (!storage) {
      throw new Error(`No package storage found for ${name}`);
    }
    storage.readPackage(name, cb);
  });

  // do the async fetching loop
  const packageList = await getPkgList();
  for (const packageName of packageList) {
    const packageMeta = await getPkgMetadata(packageName);
    if (packageMeta) {
      yield packageMeta;
    }
  }

  return;
}

export function collectDatabaseMetrics(storage: IStorageManager<MetricsConfig>, registry: Registry): () => void {
  // We delay registering these metrics until they have their first datapoint
  let isRegistered = false;

  const packageCount = new Gauge({
    name: 'database_packages_count',
    help: 'number of local packages in local database',
    registers: [],
  });
  const packageVersionsCount = new Gauge({
    name: 'database_versions_count',
    help: 'number of local versions in local database across all packages',
    registers: [],
  });
  const maxVersionsCount = new Gauge({
    name: 'database_max_package_versions_count',
    help: 'highest number of versions associated with a single local package',
    registers: [],
  });

  async function reportDatabaseGauges(): Promise<void> {
    try {
      let allPackages = 0;
      let allVersions = 0;
      let mostVersions = 0;
      for await (const pkg of iterateLocalDatabase(storage)) {
        const versionCount = Object.keys(pkg.versions ?? {}).length;
        allPackages++;
        allVersions += versionCount;
        mostVersions = Math.max(mostVersions, versionCount);
      }
      packageCount.set(allPackages);
      packageVersionsCount.set(allVersions);
      maxVersionsCount.set(mostVersions);

      if (!isRegistered) {
        registry.registerMetric(packageCount);
        registry.registerMetric(packageVersionsCount);
        registry.registerMetric(maxVersionsCount);
        isRegistered = true;
      }
    } catch (err) {
      const stack = (err as Error).stack || `${err}`;
      // eslint-disable-next-line no-console
      console.error(`WARN: Failed to collect database metrics due to`, stack);
      packageCount.reset();
      packageVersionsCount.reset();
      maxVersionsCount.reset();
    }
  }

  setTimeout(reportDatabaseGauges, 5 * 1000); // first run a few seconds after startup
  const unstampede = Math.round(Math.random() * 5 * 60 * 1000); // up to 5 minutes late ...
  const timer = setInterval(reportDatabaseGauges, 60 * 60 * 1000 + unstampede); // ... hourly
  return (): void => clearInterval(timer);
}
