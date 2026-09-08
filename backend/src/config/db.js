const mongoose = require('mongoose');
const config = require('./env');

let isConnected = false;
let mongoMemoryServer = null;

const connectDB = async () => {
  if (isConnected && mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  try {
    const conn = await mongoose.connect(config.mongodbUri, {
      serverSelectionTimeoutMS: 2000,
      autoIndex: true,
    });

    isConnected = !!conn.connections[0].readyState;
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.warn(`[Database Notice] Standard MongoDB connection to ${config.mongodbUri} was unreachable (${error.message}).`);
    console.log('[Database] Initiating Embedded In-Memory MongoDB Server for local execution...');

    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      mongoMemoryServer = await MongoMemoryServer.create({
        instance: { dbName: 'retailmind_ai' },
      });
      const uri = mongoMemoryServer.getUri();
      const memConn = await mongoose.connect(uri, { autoIndex: true });
      isConnected = true;
      console.log(`[Database] ✅ Embedded MongoDB Server Online at ${uri}`);
      return memConn;
    } catch (memErr) {
      console.error('[Database Error] Failed to start In-Memory MongoDB Server:', memErr.message);
      throw error;
    }
  }
};

mongoose.connection.on('disconnected', () => {
  isConnected = false;
  console.warn('[Database] MongoDB connection disconnected');
});

mongoose.connection.on('error', (err) => {
  console.error('[Database] MongoDB connection error:', err.message);
});

module.exports = { connectDB, mongoose };
