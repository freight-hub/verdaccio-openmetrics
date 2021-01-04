import { Router } from 'express';
import { Registry } from 'prom-client';

export function createMetricsRoute(registry: Registry): Router {
  const router = Router();
  router.get(
    '',
    async (req, res): Promise<void> => {
      res.setHeader('content-type', registry.contentType);
      res.end(await registry.metrics());
    }
  );
  return router;
}
