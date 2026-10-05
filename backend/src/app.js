import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import mongoose from 'mongoose';
import { env } from './config/env.js';
import { errorHandler } from './middleware/error.middleware.js';
import { generalLimiter } from './middleware/rateLimit.middleware.js';

import authRoutes from './routes/auth.routes.js';
import feedbackRoutes from './routes/feedback.routes.js';
import contactRoutes from './routes/contact.routes.js';
import messageRoutes from './routes/message.routes.js';
import analyticsRoutes from './routes/analytics.routes.js';
import userRoutes from './routes/user.routes.js';

const app = express();

app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);

const isDev = env.NODE_ENV !== 'production';

const corsOptions = {
  origin: (origin, callback) => {
    // 1. Allow non-browser callers (Postman, curl, server-to-server)
    if (!origin) {
      return callback(null, true);
    }

    // 2. In development or local testing, allow any localhost, LAN IP (mobile testing on Wi-Fi), or CLIENT_URL
    if (
      isDev ||
      origin === env.CLIENT_URL ||
      origin.includes('localhost') ||
      origin.includes('127.0.0.1') ||
      /^https?:\/\/(192\.168\.|10\.|172\.(1[6-9]|2[0-9]|3[0-1])\.)/.test(origin)
    ) {
      return callback(null, true);
    }

    // 3. Otherwise safely reject without throwing an unhandled exception
    return callback(null, false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  exposedHeaders: ['Set-Cookie'],
  maxAge: 86400,
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

if (env.NODE_ENV !== 'test') {
  app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));
}

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use('/api', generalLimiter);

app.get('/api', (req, res) => {
  res.json({
    name: 'SmartFeedback AI API',
    version: '1.0.0',
    tagline: 'Generate. Review. Share.',
    status: 'running',
    timestamp: new Date().toISOString(),
  });
});

app.get('/api/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  res.status(200).json({
    success: true,
    status: 'healthy',
    database: dbStatus,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/user', userRoutes);

app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Endpoint ${req.method} ${req.originalUrl} not found`,
    code: 'ROUTE_NOT_FOUND',
  });
});

app.use(errorHandler);

export default app;
