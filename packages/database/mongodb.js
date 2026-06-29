const mongoose = require('mongoose');
const { getMongoConfig } = require('@codeforge/shared/config');

let isConnected = false;

async function connect(uri) {
  if (isConnected) return;

  const mongoUri = uri || getMongoConfig().uri;

  try {
    await mongoose.connect(mongoUri);
    isConnected = true;
    console.log('[Database] Connected to MongoDB');
  } catch (err) {
    console.warn('[Database] MongoDB connection failed (running without DB):', err.message);
    // App works without DB for local-first mode
  }
}

async function disconnect() {
  if (isConnected) {
    await mongoose.disconnect();
    isConnected = false;
  }
}

module.exports = { connect, disconnect };