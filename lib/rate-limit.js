// Production-ready rate limiter using Redis
// Fallback to in-memory for development if Redis is not available

let redisClient = null;

// Initialize Redis client
async function initRedis() {
  if (process.env.REDIS_URL && !redisClient) {
    try {
      const { Redis } = await import('ioredis');
      redisClient = new Redis(process.env.REDIS_URL);
      console.log('Redis rate limiter initialized');
    } catch (error) {
      console.warn('Redis not available, falling back to in-memory rate limiter:', error.message);
      redisClient = null;
    }
  }
}

// In-memory fallback rate limiter
const rateLimitStore = new Map();

function inMemoryRateLimit({ interval, uniqueTokenPerInterval }) {
  return {
    async check(limit, token) {
      const now = Date.now();
      const windowStart = now - interval;

      // Get or create token data
      if (!rateLimitStore.has(token)) {
        rateLimitStore.set(token, []);
      }

      const tokenData = rateLimitStore.get(token);

      // Remove expired entries
      const validEntries = tokenData.filter(timestamp => timestamp > windowStart);

      // Check if limit exceeded
      if (validEntries.length >= limit) {
        return { success: false, limit, remaining: 0, reset: windowStart + interval };
      }

      // Add current request
      validEntries.push(now);
      rateLimitStore.set(token, validEntries);

      // Clean up old entries periodically
      if (Math.random() < 0.01) { // 1% chance to clean up
        for (const [key, timestamps] of rateLimitStore.entries()) {
          const validTimestamps = timestamps.filter(timestamp => timestamp > windowStart);
          if (validTimestamps.length === 0) {
            rateLimitStore.delete(key);
          } else {
            rateLimitStore.set(key, validTimestamps);
          }
        }
      }

      return {
        success: true,
        limit,
        remaining: limit - validEntries.length,
        reset: windowStart + interval
      };
    }
  };
}

// Redis-based rate limiter
function redisRateLimit({ interval, uniqueTokenPerInterval }) {
  return {
    async check(limit, token) {
      if (!redisClient) {
        throw new Error('Redis client not initialized');
      }

      const now = Date.now();
      const windowStart = now - interval;
      const key = `rate_limit:${token}`;

      try {
        // Remove expired entries
        await redisClient.zremrangebyscore(key, 0, windowStart);

        // Count current entries
        const currentCount = await redisClient.zcard(key);

        if (currentCount >= limit) {
          return { success: false, limit, remaining: 0, reset: windowStart + interval };
        }

        // Add current request
        await redisClient.zadd(key, now, now.toString());
        await redisClient.expire(key, Math.ceil(interval / 1000));

        return {
          success: true,
          limit,
          remaining: limit - currentCount - 1,
          reset: windowStart + interval
        };
      } catch (error) {
        console.error('Redis rate limit error:', error);
        // Fall back to allowing the request if Redis fails
        return { success: true, limit, remaining: 1, reset: now + interval };
      }
    }
  };
}

// Main export function
export async function rateLimit({ interval, uniqueTokenPerInterval }) {
  // Initialize Redis on first use
  await initRedis();

  // Use Redis if available, otherwise fall back to in-memory
  return redisClient ? redisRateLimit({ interval, uniqueTokenPerInterval }) : inMemoryRateLimit({ interval, uniqueTokenPerInterval });
}

// Production-ready rate limiter using Redis (uncomment and configure as needed)
/*
import { Redis } from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

export async function redisRateLimit({ interval, uniqueTokenPerInterval }) {
  return {
    async check(limit, token) {
      const now = Date.now();
      const windowStart = now - interval;
      const key = `rate_limit:${token}`;
      
      try {
        // Remove expired entries
        await redis.zremrangebyscore(key, 0, windowStart);
        
        // Count current entries
        const currentCount = await redis.zcard(key);
        
        if (currentCount >= limit) {
          return { success: false, limit, remaining: 0, reset: windowStart + interval };
        }
        
        // Add current request
        await redis.zadd(key, now, now.toString());
        await redis.expire(key, Math.ceil(interval / 1000));
        
        return { 
          success: true, 
          limit, 
          remaining: limit - currentCount - 1,
          reset: windowStart + interval
        };
      } catch (error) {
        console.error('Redis rate limit error:', error);
        // Fall back to allowing the request if Redis fails
        return { success: true, limit, remaining: 1, reset: now + interval };
      }
    }
  };
}
*/
