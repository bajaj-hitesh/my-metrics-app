const express = require('express');
const prometheus = require('prom-client');
const app = express();
const port = 7000;

// Create a Registry to register the metrics
const register = new prometheus.Registry();

// Create a Counter metric for the number of requests
const requestCounter = new prometheus.Counter({
  name: 'provisioning_requests_total',
  help: 'Total number of Provisioning requests',
  labelNames: ['method', 'route', 'status_code'],
});

// Create a Histogram metric for the response time
const responseHistogram = new prometheus.Histogram({
  name: 'provisioning_response_duration_seconds',
  help: 'Histogram of Provisioning response durations',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 0.5, 1, 2, 5, 10] // Adjust buckets as needed
});

// Register metrics
register.registerMetric(requestCounter);
register.registerMetric(responseHistogram);

// Middleware to measure response time and request count
app.use((req, res, next) => {
  const end = responseHistogram.startTimer({ method: req.method, route: req.path });

  res.on('finish', () => {
    if(req.url != '/metrics'){
      requestCounter.inc({ method: req.method, route: req.path, status_code: res.statusCode });
    end({ method: req.method, route: req.path, status_code: res.statusCode });
    }
    
  });

  next();
});

// Define your routes
app.get('/provision-account', (req, res) => {
  // Simulate some work with a delay
  setTimeout(() => {
    res.send('Hello, world!');
  }, Math.random() * 10); // Random delay to simulate work
});

// Endpoint to expose Prometheus metrics
app.get('/metrics', async (req, res) => {
  res.setHeader('Content-Type', register.contentType);
  res.end(await register.metrics());
});

// Start the server
app.listen(port, '0.0.0.0');

