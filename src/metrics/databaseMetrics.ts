import { IStorageManager, Version } from "@verdaccio/types";
import { MetricsConfig } from "../../types";
import * as promClient from "prom-client";

export function collectDatabaseMetrics(
  storage: IStorageManager<MetricsConfig>,
  registry = promClient.register,
) {

  function reportDatabaseGauges() {
    storage.getLocalDatabase(function (err: any, packages: Version[]) {
      console.log('TODO: received database listing with', packages.length, 'packages');
    });
  }

  setTimeout(reportDatabaseGauges, 5000);
  setInterval(reportDatabaseGauges, 60*60*1000); // hourly
}
