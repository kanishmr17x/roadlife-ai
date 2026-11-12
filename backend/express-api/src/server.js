const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const app = require('./app');
const { connectDB } = require('./config/db');

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, async () => {
  console.log(`RoadSense backend listening on port ${PORT}`);

  // Auto-connect to MongoDB if configured in environment
  const mongoUri = process.env.MONGO_URI;
  if (mongoUri && mongoUri.trim()) {
    try {
      await connectDB();
      console.log('MongoDB connection active and verified.');
    } catch (err) {
      console.warn('MongoDB connection could not be established on startup; operating in resilient in-memory mode.', err.message);
    }
  } else {
    console.log('No MONGO_URI configured in environment; running in resilient in-memory fallback mode.');
  }
});

// Graceful process termination
process.on('SIGINT', async () => {
  console.log('Shutting down server gracefully...');
  server.close(async () => {
    const mongoose = require('mongoose');
    if (mongoose.connection && mongoose.connection.readyState !== 0) {
      await mongoose.connection.close(false);
    }
    process.exit(0);
  });
});

module.exports = server;
