import { Router } from 'express';
import { Registry } from 'prom-client';

export function createMetricsRoute(registry: Registry) {
  const router = Router();
  router.get('', async (req, res, next) => {
    res.setHeader('content-type', registry.contentType);
    res.end(await registry.metrics());
  });
  return router;
}
