// src/routes/health.js
const express = require('express');
const router = express.Router();

// Health check endpoint
router.get('/', (req, res) => {
  res.json({
    status: 'ok',                // simple status message
    uptime: process.uptime(),    // how long server has been running
    timestamp: new Date().toISOString() // current server time
  });
});

module.exports = router;
