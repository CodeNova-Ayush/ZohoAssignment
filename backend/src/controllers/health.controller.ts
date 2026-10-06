import { Request, Response } from 'express';
import { prisma } from '../config/db.js';
import { getRedisClient, isRedisAvailable } from '../config/redis.js';

export class HealthController {
  public static async getHealth(_req: Request, res: Response): Promise<void> {
    const startTime = Date.now();

    // Check Postgres
    let dbStatus = 'disconnected';
    let dbLatencyMs = 0;
    try {
      const dbStart = Date.now();
      await prisma.$queryRaw`SELECT 1`;
      dbLatencyMs = Date.now() - dbStart;
      dbStatus = 'healthy';
    } catch (err: any) {
      dbStatus = `unhealthy: ${err.message}`;
    }

    // Check Redis
    let redisStatus = 'disconnected';
    let redisLatencyMs = 0;
    try {
      const redis = getRedisClient();
      if (redis && isRedisAvailable()) {
        const redisStart = Date.now();
        const pong = await redis.ping();
        redisLatencyMs = Date.now() - redisStart;
        redisStatus = pong === 'PONG' ? 'healthy' : 'degraded';
      } else {
        redisStatus = 'unavailable (operating in bypass mode)';
      }
    } catch (err: any) {
      redisStatus = `unhealthy: ${err.message}`;
    }

    const totalDurationMs = Date.now() - startTime;
    const isOverallHealthy = dbStatus === 'healthy';

    res.status(isOverallHealthy ? 200 : 503).json({
      status: isOverallHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      responseTimeMs: totalDurationMs,
      services: {
        database: {
          type: 'PostgreSQL',
          status: dbStatus,
          latencyMs: dbLatencyMs,
        },
        cache: {
          type: 'Redis',
          status: redisStatus,
          latencyMs: redisLatencyMs,
        },
      },
    });
  }
}
