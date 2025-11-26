// Prometheus metrics collection
// In production, use prom-client package

const metrics = {
  httpRequestsTotal: 0,
  httpRequestDuration: [],
  activeConnections: 0,
  ordersCreated: 0,
  ordersCompleted: 0,
  errorsTotal: 0
};

const recordRequest = (method, path, statusCode, duration) => {
  metrics.httpRequestsTotal++;
  metrics.httpRequestDuration.push(duration);
  
  // Keep only last 1000 durations
  if (metrics.httpRequestDuration.length > 1000) {
    metrics.httpRequestDuration.shift();
  }
};

const recordOrder = (status) => {
  if (status === 'Delivered') {
    metrics.ordersCompleted++;
  } else if (status === 'Order Placed') {
    metrics.ordersCreated++;
  }
};

const recordError = () => {
  metrics.errorsTotal++;
};

const getMetrics = () => {
  const avgDuration = metrics.httpRequestDuration.length > 0
    ? metrics.httpRequestDuration.reduce((a, b) => a + b, 0) / metrics.httpRequestDuration.length
    : 0;

  return {
    http_requests_total: metrics.httpRequestsTotal,
    http_request_duration_seconds_avg: avgDuration,
    active_connections: metrics.activeConnections,
    orders_created_total: metrics.ordersCreated,
    orders_completed_total: metrics.ordersCompleted,
    errors_total: metrics.errorsTotal
  };
};

module.exports = {
  recordRequest,
  recordOrder,
  recordError,
  getMetrics
};

