import mongoose from 'mongoose';
import dns from 'dns';
import { env } from './env.js';
import { logger } from '../utils/logger.js';

// Force Node.js to use public DNS resolvers — fixes Windows local DNS SRV lookup drops
try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
} catch (dnsErr) {
  logger.warn('Could not set custom DNS servers:', dnsErr.message);
}

let isConnecting = false;

export async function connectDB(retries = 5, delayMs = 3000) {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }
  if (isConnecting) {
    return;
  }

  isConnecting = true;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const conn = await mongoose.connect(env.MONGODB_URI, {
        serverSelectionTimeoutMS: 15000,
        socketTimeoutMS: 45000,
        family: 4, // IPv4 first to avoid IPv6 Windows ECONNREFUSED issues
        retryWrites: true,
        w: 'majority',
      });
      logger.info(`MongoDB Connected successfully: ${conn.connection.host}`);
      isConnecting = false;
      return conn;
    } catch (error) {
      logger.error(`MongoDB Connection Attempt ${attempt}/${retries} failed: ${error.message}`);
      if (attempt < retries) {
        logger.info(`Retrying MongoDB connection in ${delayMs / 1000}s...`);
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      } else {
        isConnecting = false;
        if (env.NODE_ENV === 'production') {
          process.exit(1);
        }
      }
    }
  }
}

mongoose.connection.on('connected', () => {
  logger.info('MongoDB connection established');
});

mongoose.connection.on('disconnected', () => {
  logger.warn('MongoDB disconnected. Initiating automatic reconnection...');
  setTimeout(() => {
    connectDB(5, 3000).catch((err) => {
      logger.error('Auto-reconnect failed:', err.message);
    });
  }, 2000);
});

mongoose.connection.on('error', (err) => {
  logger.error(`MongoDB connection error: ${err.message}`);
});
