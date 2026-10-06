import { createServer } from 'http';
import { app } from './app.js';
import { env } from './config/env.js';
import { connectDB, prisma } from './config/db.js';
import { getRedisClient } from './config/redis.js';

const server = createServer(app);

async function startServer() {
  try {
    await connectDB();

    server.listen(env.PORT, () => {
      console.log('====================================================');
      console.log(`🚀 Delivery Agent Backend API running on port ${env.PORT}`);
      console.log(`🌐 Base URL: http://localhost:${env.PORT}`);
      console.log(`📊 Health check: http://localhost:${env.PORT}/api/health`);
      console.log(`📦 Agents API: http://localhost:${env.PORT}/api/agents`);
      console.log(`🗄️  Environment: ${env.NODE_ENV}`);
      console.log('====================================================');
    });
  } catch (error) {
    console.error('Fatal error starting server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
async function gracefulShutdown(signal: string) {
  console.log(`\nReceived ${signal}. Shutting down gracefully...`);

  server.close(async () => {
    console.log('HTTP server closed.');

    try {
      await prisma.$disconnect();
      console.log('Database connection disconnected.');
    } catch (e) {
      console.error('Error disconnecting database:', e);
    }

    try {
      const redis = getRedisClient();
      if (redis) {
        await redis.quit();
        console.log('Redis connection closed.');
      }
    } catch (e) {
      console.error('Error disconnecting Redis:', e);
    }

    process.exit(0);
  });

  setTimeout(() => {
    console.error('Forced shutdown after 10s timeout.');
    process.exit(1);
  }, 10000);
}

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

startServer();
