const http = require('http');
const client = require('@prometheus-io/client');
const logger = require('./logger');

const httpRequests = new client.Counter({
  name: 'http_requests_total',
  help: 'HTTP requests',
  labelNames: ['method', 'route', 'status']
});

const httpDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'HTTP request duration',
  labelNames: ['method', 'route', 'status']
});

const queueBacklog = new client.Gauge({
  name: 'trampoline_queue_backlog',
  help: 'Requests waiting in queue',
  labelNames: ['queue']
});

const queueWait = new client.Histogram({
  name: 'trampoline_queue_wait_seconds',
  help: 'Time spent waiting in queue',
  labelNames: ['queue'],
  buckets: [0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10, 20, 40, 60]
});

const queueRejected = new client.Counter({
  name: 'trampoline_queue_rejected_total',
  help: 'Requests rejected because queue was full',
  labelNames: ['queue']
});

const upstreamDuration = new client.Histogram({
  name: 'trampoline_upstream_request_duration_seconds',
  help: 'Upstream request duration',
  labelNames: ['queue', 'status'],
  buckets: [0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10, 30]
});

const cacheLookups = new client.Counter({
  name: 'trampoline_cache_lookups_total',
  help: 'Cache lookups',
  labelNames: ['type', 'result']
});

const rateLimited = new client.Counter({
  name: 'trampoline_rate_limited_total',
  help: 'Requests over a rate limit',
  labelNames: ['name']
});

const getLowCardinalityPath = (req) => {
  // Explicit route name
  if (req.metricsRoute) {
    return req.metricsRoute;
  }
  // Express route
  if (req.route && typeof req.route.path === 'string') {
    return (req.baseUrl || '') + req.route.path;
  }
  // Fallback - don't let 404 explode cardinality
  return 'other';
};

const middleware = (req, res, next) => {
  const end = httpDuration.startTimer();
  res.on('close', () => {
    try {
      const labels = {
        method: req.method,
        route: getLowCardinalityPath(req),
        status: res.writableFinished ? res.statusCode : 'aborted'
      };
      httpRequests.inc(labels);
      end(labels);
    } catch (error) {
      logger.error('' + ((error && error.stack) || error));
    }
  });
  next();
};

const listen = () => {
  if (!process.env.METRICS_PORT) {
    return;
  }

  const port = +process.env.METRICS_PORT;
  client.collectDefaultMetrics();

  const metricsServer = http.createServer((req, res) => {
    client.register.metrics()
      .then((body) => {
        res.setHeader('Content-Type', client.register.contentType);
        res.end(body);
      })
      .catch((error) => {
        logger.error('' + ((error && error.stack) || error));
        res.statusCode = 500;
        res.end();
      });
  });

  metricsServer.listen(port, '127.0.0.1', () => {
    logger.info('Metrics on port: %s', port);
  });
};

module.exports = {
  queueBacklog,
  queueWait,
  queueRejected,
  upstreamDuration,
  cacheLookups,
  rateLimited,
  middleware,
  listen
};
