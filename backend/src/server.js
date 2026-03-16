const mongoose = require('mongoose');
const app = require('./app');
const logger = require('./utils/logger');
require('dotenv').config();

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/zwiggato';

// Connect to MongoDB
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  logger.info('--- 🍃 Connected to MongoDB Successfully ---');
  
  app.listen(PORT, () => {
    logger.info(`--- 🚀 Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode ---`);
  });
})
.catch((error) => {
  logger.error('--- ❌ MongoDB connection error:', error.message);
  process.exit(1);
});

module.exports = app;
