const mongoose = require('mongoose');

let listenersBound = false;

function bindConnectionEvents() {
  if (listenersBound) return;

  mongoose.connection.on('connected', () => {
    console.log('MongoDB connection established');
  });

  mongoose.connection.on('error', (err) => {
    // Log error message only; avoid logging connection strings or credentials
    console.error('MongoDB connection error:', err && err.message ? err.message : 'Unknown error');
  });

  mongoose.connection.on('disconnected', () => {
    console.log('MongoDB connection disconnected');
  });

  listenersBound = true;
}

/**
 * Connect to MongoDB using the connection string defined in process.env.MONGO_URI.
 *
 * @param {string} [customUri] - Optional URI override (e.g. for testing)
 * @param {object} [options] - Optional Mongoose connection options override
 * @returns {Promise<typeof mongoose>}
 */
async function connectDB(customUri, options = {}) {
  const uri = customUri || process.env.MONGO_URI;

  if (!uri || typeof uri !== 'string' || uri.trim() === '') {
    throw new Error('MONGO_URI is not defined. Please set it in your environment.');
  }

  bindConnectionEvents();

  if (mongoose.connection.readyState === 1) {
    return mongoose;
  }

  const defaultOptions = {
    serverSelectionTimeoutMS: 5000, // 5s timeout prevents hanging on invalid network/credentials
    ...options
  };

  try {
    await mongoose.connect(uri, defaultOptions);
    return mongoose;
  } catch (error) {
    // Propagate error to caller without logging credentials or URI
    throw error;
  }
}

module.exports = { connectDB };
