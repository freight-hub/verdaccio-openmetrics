// stripped down / opinionated subset of:
// https://github.com/jochen-schweizer/express-prom-bundle/blob/master/src/index.js

import onFinished from 'on-finished';
import { Registry, Histogram } from 'prom-client';
import { Request, Response, NextFunction } from 'express';

type RequestMiddleware = (req: Request, res: Response, next: NextFunction) => void;

export function setupRequestInterceptor(registry: Registry): RequestMiddleware {
  const httpMetricName = 'http_request_duration_seconds';
  const labels = ['status_code', 'method'];
  const httpMetric = new Histogram({
    name: httpMetricName,
    help: 'duration histogram of http responses labeled with: ' + labels.join(', '),
    labelNames: labels,
    buckets: [0.003, 0.03, 0.1, 0.3, 1.5, 10],
    registers: [registry],
  });

  return function(req, res, next): void {
    // const path = req.originalUrl || req.url;
    // if (opts.excludeRoutes && matchVsRegExps(path, opts.excludeRoutes)) {
    //   return next();
    // }

    const labels: Record<string, string> = {};
    const timer = httpMetric.startTimer(labels);

    onFinished(res, (): void => {
      labels.status_code = res.statusCode.toFixed(0);
      labels.method = req.method;
      timer();
    });

    next();
  };
}
