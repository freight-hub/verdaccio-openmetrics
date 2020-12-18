import * as promClient from "prom-client";

export function collectUpMetrics(
  registry = promClient.register,
) {

  const up = new promClient.Gauge({
    name: 'up',
    help: '1 = up, anything else = not up',
    registers: [registry]
  });
  up.set(1);

}
