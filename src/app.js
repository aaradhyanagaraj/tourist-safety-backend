// src/app.js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const healthRouter = require('./routes/health');

const app = express();

/* ----------- Middlewares ----------- */
app.use(helmet());        // adds security headers (helps protect from attacks)
app.use(cors());          // allows requests from frontend (React Native, etc.)
app.use(express.json());  // parses JSON request bodies into req.body
app.use(morgan('dev'));   // logs HTTP requests in console (method, status, time)

/* ----------- Routes ----------- */
app.use('/api/health', healthRouter);

/* ----------- 404 Handler ----------- */
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

/* ----------- Error Handler ----------- */
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error'
  });
});

module.exports = app;
