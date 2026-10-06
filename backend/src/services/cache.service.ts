import crypto from 'crypto';
import { getRedisClient, isRedisAvailable } from '../config/redis.js';
import { env } from '../config/env.js';

export class CacheService {
  private static defaultTTL = env.REDIS_CACHE_TTL_SECONDS;

  /**
   * Retrieves a JSON-deserialized value from Redis.
   * Returns null if key is not found or Redis is unavailable.
   */
  public static async get<T>(key: string): Promise<T | null> {
    const client = getRedisClient();
    if (!client || !isRedisAvailable()) {
      return null;
    }

    try {
      const data = await client.get(key);
      if (!data) return null;
      return JSON.parse(data) as T;
    } catch (error) {
      console.warn(`[CacheService] Failed to read key "${key}":`, error);
      return null;
    }
  }

  /**
   * Serializes and sets a value in Redis with a TTL in seconds.
   */
  public static async set(key: string, value: unknown, ttlSeconds = this.defaultTTL): Promise<boolean> {
    const client = getRedisClient();
    if (!client || !isRedisAvailable()) {
      return false;
    }

    try {
      const serialized = JSON.stringify(value);
      await client.set(key, serialized, 'EX', ttlSeconds);
      return true;
    } catch (error) {
      console.warn(`[CacheService] Failed to set key "${key}":`, error);
      return false;
    }
  }

  /**
   * Deletes a single key from Redis.
   */
  public static async del(key: string): Promise<boolean> {
    const client = getRedisClient();
    if (!client || !isRedisAvailable()) {
      return false;
    }

    try {
      const count = await client.del(key);
      return count > 0;
    } catch (error) {
      console.warn(`[CacheService] Failed to delete key "${key}":`, error);
      return false;
    }
  }

  /**
   * Deletes all keys matching a pattern using non-blocking SCAN.
   * Prevents blocking the Redis event loop.
   */
  public static async delByPattern(pattern: string): Promise<number> {
    const client = getRedisClient();
    if (!client || !isRedisAvailable()) {
      return 0;
    }

    try {
      let cursor = '0';
      let totalDeleted = 0;

      do {
        const [nextCursor, keys] = await client.scan(cursor, 'MATCH', pattern, 'COUNT', 100);
        cursor = nextCursor;

        if (keys.length > 0) {
          const deleted = await client.del(...keys);
          totalDeleted += deleted;
        }
      } while (cursor !== '0');

      return totalDeleted;
    } catch (error) {
      console.warn(`[CacheService] Failed to delete pattern "${pattern}":`, error);
      return 0;
    }
  }

  /**
   * Flushes all cached data for delivery agents.
   */
  public static async flushAgentCaches(): Promise<void> {
    await Promise.all([
      this.delByPattern('agent:*'),
      this.delByPattern('agents:list:*'),
      this.del('agents:stats:summary'),
    ]);
  }

  /**
   * Builds cache key for a specific agent.
   */
  public static buildAgentKey(id: string): string {
    return `agent:${id}`;
  }

  /**
   * Builds cache key for agent list query with deterministic parameter sorting.
   */
  public static buildListKey(params: Record<string, unknown>): string {
    const sortedKeys = Object.keys(params).sort();
    const normalized: Record<string, unknown> = {};

    for (const key of sortedKeys) {
      const val = params[key];
      if (val !== undefined && val !== null && val !== '') {
        normalized[key] = val;
      }
    }

    const hash = crypto
      .createHash('md5')
      .update(JSON.stringify(normalized))
      .digest('hex');

    return `agents:list:${hash}`;
  }

  public static getStatsKey(): string {
    return 'agents:stats:summary';
  }

  /**
   * Invalidation strategy when an agent is created:
   * - Invalidate list caches (since count/page order has changed)
   * - Invalidate stats summary
   */
  public static async onAgentCreated(): Promise<void> {
    await Promise.all([
      this.delByPattern('agents:list:*'),
      this.del(this.getStatsKey()),
    ]);
  }

  /**
   * Invalidation strategy when an agent is updated:
   * - Invalidate specific agent cache
   * - Invalidate list caches (since filtered attributes or status might have changed)
   * - Invalidate stats summary
   */
  public static async onAgentUpdated(id: string): Promise<void> {
    await Promise.all([
      this.del(this.buildAgentKey(id)),
      this.delByPattern('agents:list:*'),
      this.del(this.getStatsKey()),
    ]);
  }

  /**
   * Invalidation strategy when an agent is deleted:
   * - Invalidate specific agent cache
   * - Invalidate list caches
   * - Invalidate stats summary
   */
  public static async onAgentDeleted(id: string): Promise<void> {
    await Promise.all([
      this.del(this.buildAgentKey(id)),
      this.delByPattern('agents:list:*'),
      this.del(this.getStatsKey()),
    ]);
  }
}
