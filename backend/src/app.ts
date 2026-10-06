import express, { Request, Response } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { apiRouter } from './routes/index.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { env } from './config/env.js';

export const app = express();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS configuration
const allowedOrigins = env.CORS_ORIGIN.split(',').map((origin) => origin.trim());
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, true); // Permissive in development
      }
    },
    credentials: true,
    exposedHeaders: ['X-Cache'],
  })
);

if (env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// API Routes
app.use('/api', apiRouter);

// Root informational endpoint
app.get('/', (_req: Request, res: Response) => {
  res.json({
    name: 'Delivery Agent Management System API',
    version: '1.0.0',
    documentation: {
      health: '/api/health',
      agents: '/api/agents',
      stats: '/api/agents/stats/summary',
    },
  });
});

// 404 Handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: {
      message: `Cannot ${req.method} ${req.originalUrl} - Route not found`,
      code: 'ROUTE_NOT_FOUND',
    },
  });
});

// Global Error Handler
app.use(errorHandler);
