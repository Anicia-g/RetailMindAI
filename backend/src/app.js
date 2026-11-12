const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const config = require('./config/env');
const routes = require('./routes');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

const app = express();

// Security Headers
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// CORS Configuration — Production Safe & Environment Driven
const rawFrontendUrls = (config.frontendUrl || '').split(',').map((u) => u.trim()).filter(Boolean);
const devOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:3001',
  'http://127.0.0.1:3001',
];

const allowedOrigins = [...new Set([...rawFrontendUrls, ...devOrigins])];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps, curl, server-to-server)
      if (!origin) {
        return callback(null, true);
      }

      // Check configured exact origins
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      // Allow Vercel deployment domains (*.vercel.app)
      if (/^https:\/\/[a-zA-Z0-9-]+\.vercel\.app$/.test(origin)) {
        return callback(null, true);
      }

      // In development mode, permit local testing
      if (config.env === 'development') {
        return callback(null, true);
      }

      // In production, reject unallowed origins
      const msg = `CORS blocked: The origin ${origin} is not authorized for this API.`;
      return callback(new Error(msg), false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);

// Body Parsing & Cookie Handling
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Request Logging
if (config.env === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Root Route
app.get('/', (req, res) => {
  res.json({
    name: 'RetailMind AI API',
    version: '1.0.0',
    description: 'AI-Powered Supermarket & Retail Enterprise Intelligence REST API',
    documentation: '/api/health',
    status: 'ACTIVE',
  });
});

// API Routes
app.use('/api', routes);

// Error Handling Middlewares
app.use(notFound);
app.use(errorHandler);

module.exports = app;
