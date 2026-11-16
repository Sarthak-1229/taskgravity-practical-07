/**
 * MongoDB / Mongoose Connection Manager
 */

const dns = require('dns');
try {
  // Use Google and Cloudflare public DNS to ensure robust SRV lookup across ISP routers
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {
  // Ignore if restricted in sandboxed environment
}

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
      serverSelectionTimeoutMS: 8000
    });
    isConnected = true;
    console.log(`[MongoDB Atlas] Connected successfully to host: ${conn.connection.host}`);
    console.log(`[MongoDB Atlas] Database Name: ${conn.connection.name}`);
    return true;
  } catch (err) {
    isConnected = false;
    console.warn(`[MongoDB Warning] Could not connect to MongoDB at "${uri.replace(/:([^:@]{4,})@/, ':****@')}": ${err.message}`);
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
