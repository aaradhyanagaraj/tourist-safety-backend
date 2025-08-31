// src/server.js
require('dotenv').config();  // load environment variables from .env file
const app = require('./app');

const PORT = process.env.PORT || 5000;  // default to 5000 if not set

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
