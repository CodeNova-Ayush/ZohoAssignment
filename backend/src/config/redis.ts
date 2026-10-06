import Redis from 'ioredis';
import { env } from './env.js';

let redisClient: Redis | null = null;
let isRedisConnected = false;

if (env.REDIS_CACHE_ENABLED) {
  try {
    redisClient = new Redis(env.REDIS_URL, {
      maxRetriesPerRequest: 3,
      retryStrategy(times) {
        const delay = Math.min(times * 150, 2000);
        return delay;
      },
      lazyConnect: false,
    });

    redisClient.on('connect', () => {
      console.log('🔄 Redis connecting...');
    });

    redisClient.on('ready', () => {
      isRedisConnected = true;
      console.log('✅ Redis connected and ready');
    });

    redisClient.on('error', (err) => {
      isRedisConnected = false;
      console.warn('⚠️  Redis connection error (operating in cache-bypass mode):', err.message);
    });

    redisClient.on('close', () => {
      isRedisConnected = false;
      console.log('ℹ️  Redis connection closed');
    });
  } catch (err) {
    console.warn('⚠️  Failed to initialize Redis client, proceeding without cache:', err);
    redisClient = null;
  }
} else {
  console.log('ℹ️  Redis cache is disabled via configuration');
}

export function getRedisClient(): Redis | null {
  return redisClient;
}

export function isRedisAvailable(): boolean {
  return isRedisConnected && redisClient !== null && redisClient.status === 'ready';
}
