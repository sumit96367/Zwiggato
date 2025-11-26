const express = require('express');
const { getMetrics } = require('../utils/prometheus');

const router = express.Router();

// Prometheus metrics endpoint
router.get('/metrics', (req, res) => {
  const metrics = getMetrics();
  
  // Format as Prometheus text format
  let prometheusFormat = '';
  for (const [key, value] of Object.entries(metrics)) {
    prometheusFormat += `${key} ${value}\n`;
  }
  
  res.set('Content-Type', 'text/plain');
  res.send(prometheusFormat);
});

module.exports = router;

