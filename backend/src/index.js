import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import config from './config/app.js';
import prisma from './config/prisma.js';
import redis from './config/redis.js';
import apiRouter from './routes/api.js';
import { errorHandler } from './middleware/errorHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: config.nodeEnv === 'production' ? {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    }
  } : false
}));

// CORS configuration with logging
console.log('🔒 CORS Origins:', config.corsOrigin);
app.use(cors({ 
  origin: config.corsOrigin, 
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Logging middleware
app.use(morgan('dev'));

// Health check endpoint (before any other routes)
app.get('/healthz', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'gatwick-bank-backend',
    timestamp: new Date().toISOString()
  });
});

// Serve uploaded files (MUST be before SPA fallback)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// API routes with versioning
app.use('/api/v1', apiRouter);

// Legacy API route support
app.use('/api', apiRouter);

// Serve static files from frontend build (production only)
if (config.nodeEnv === 'production') {
  const frontendDistPath = path.join(__dirname, '../../frontend/dist');
  app.use(express.static(frontendDistPath));
  
  // Serve index.html for all non-API, non-uploads routes (SPA support)
  app.get('*', (req, res) => {
    // Don't serve index.html for API or uploads routes
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
      return res.status(404).json({ error: 'Route not found' });
    }
    res.sendFile(path.join(frontendDistPath, 'index.html'));
  });
} else {
  // 404 handler for development
  app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
  });
}

// Error handling middleware
app.use(errorHandler);

const server = app.listen(config.port, () => {
  console.log(`✅ API listening on port ${config.port}`);
  console.log(`📦 Environment: ${config.nodeEnv}`);
  console.log(`🔗 API endpoints available at http://localhost:${config.port}/api/v1`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('⏹️  SIGTERM received, shutting down gracefully...');
  server.close(async () => {
    await prisma.$disconnect();
    redis.disconnect();
    process.exit(0);
  });
});

export default app;
