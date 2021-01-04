import { Registry, Gauge } from 'prom-client';

export function collectUpMetrics(registry: Registry): void {
  const up = new Gauge({
    name: 'up',
    help: '1 = up, anything else = not up',
    registers: [registry],
  });
  up.set(1);
}
