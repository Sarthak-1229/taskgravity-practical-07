/**
 * MongoDB / Mongoose Connection Manager
 */

let mongoose;
try {
  mongoose = require('mongoose');
} catch (e) {
  console.warn('[DB Config] mongoose not yet installed in local folder. Run npm install.');
}

let isConnected = false;

async function connectDB() {
  if (!mongoose) return false;

  const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/TaskGravityDB';

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000
    });
    isConnected = true;
    console.log(`[MongoDB] Connected successfully to host: ${conn.connection.host}`);
    console.log(`[MongoDB] Database Name: ${conn.connection.name}`);
    return true;
  } catch (err) {
    isConnected = false;
    console.warn(`[MongoDB Warning] Could not connect to MongoDB at "${uri}": ${err.message}`);
    console.warn(`[MongoDB Guide] Please check your .env MONGO_URI or start local mongod.`);
    return false;
  }
}

function getDbStatus() {
  return {
    connected: isConnected,
    uri: process.env.MONGO_URI ? process.env.MONGO_URI.replace(/:([^:@]{4,})@/, ':****@') : 'Not configured'
  };
}

module.exports = {
  connectDB,
  getDbStatus,
  getMongoose: () => mongoose
};
