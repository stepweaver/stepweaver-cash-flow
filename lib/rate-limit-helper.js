import { rateLimit } from './rate-limit.js';

// Rate limiter instances cache
const rateLimiters = new Map();

// Initialize rate limiter with proper configuration
export async function initRateLimiter(config) {
  const configKey = JSON.stringify(config);

  if (!rateLimiters.has(configKey)) {
    const limiter = await rateLimit(config);
    rateLimiters.set(configKey, limiter);
  }

  return rateLimiters.get(configKey);
}

// Common rate limiter configurations
export const RATE_LIMIT_CONFIGS = {
  // High limit for development, lower for production
  STANDARD: {
    interval: 60 * 1000, // 1 minute
    uniqueTokenPerInterval: 500
  },

  // More restrictive for sensitive operations
  RESTRICTIVE: {
    interval: 60 * 1000, // 1 minute
    uniqueTokenPerInterval: 100
  },

  // Very restrictive for authentication
  AUTH: {
    interval: 60 * 1000, // 1 minute
    uniqueTokenPerInterval: 50
  }
};

// Helper function to get rate limiter with standard config
export async function getStandardRateLimiter() {
  return initRateLimiter(RATE_LIMIT_CONFIGS.STANDARD);
}

// Helper function to get rate limiter with restrictive config
export async function getRestrictiveRateLimiter() {
  return initRateLimiter(RATE_LIMIT_CONFIGS.RESTRICTIVE);
}

// Helper function to get rate limiter with auth config
export async function getAuthRateLimiter() {
  return initRateLimiter(RATE_LIMIT_CONFIGS.AUTH);
}
