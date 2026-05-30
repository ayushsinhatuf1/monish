import Redis from 'ioredis';
import { env } from './env';

let redis: Redis | null = null;
let redisAvailable = false;

try {
  redis = new Redis(env.REDIS_URL, {
    maxRetriesPerRequest: 3,
    retryStrategy(times) {
      if (times > 3) {
        console.warn('⚠️  Redis unavailable — using in-memory fallback');
        return null; // Stop retrying
      }
      return Math.min(times * 50, 2000);
    },
    lazyConnect: true,
    connectTimeout: 3000,
  });

  redis.on('connect', () => {
    redisAvailable = true;
    console.log('✅ Redis connected');
  });

  redis.on('error', (err) => {
    if (redisAvailable) {
      console.error('❌ Redis error:', err.message);
    }
    redisAvailable = false;
  });

  // Try to connect but don't block startup
  redis.connect().catch(() => {
    console.warn('⚠️  Redis not available — using in-memory store for OTP and counters');
  });
} catch {
  console.warn('⚠️  Redis not available — using in-memory store');
}

// In-memory fallback store for when Redis is not available
const memoryStore = new Map<string, { value: string; expiresAt: number }>();

function cleanupExpired() {
  const now = Date.now();
  for (const [key, entry] of memoryStore) {
    if (entry.expiresAt <= now) memoryStore.delete(key);
  }
}

// Cleanup every 60 seconds
setInterval(cleanupExpired, 60_000);

// Helper functions that fallback to in-memory if Redis is down
export const redisHelpers = {
  async setWithExpiry(key: string, value: string, ttlSeconds: number): Promise<void> {
    if (redisAvailable && redis) {
      await redis.setex(key, ttlSeconds, value);
    } else {
      memoryStore.set(key, { value, expiresAt: Date.now() + ttlSeconds * 1000 });
    }
  },

  async get(key: string): Promise<string | null> {
    if (redisAvailable && redis) {
      return redis.get(key);
    }
    const entry = memoryStore.get(key);
    if (!entry) return null;
    if (entry.expiresAt <= Date.now()) {
      memoryStore.delete(key);
      return null;
    }
    return entry.value;
  },

  async del(key: string): Promise<void> {
    if (redisAvailable && redis) {
      await redis.del(key);
    } else {
      memoryStore.delete(key);
    }
  },

  async increment(key: string): Promise<number> {
    if (redisAvailable && redis) {
      return redis.incr(key);
    }
    const entry = memoryStore.get(key);
    const current = entry ? parseInt(entry.value, 10) : 0;
    const next = current + 1;
    memoryStore.set(key, { value: next.toString(), expiresAt: entry?.expiresAt || Date.now() + 3600_000 });
    return next;
  },

  async decrement(key: string): Promise<number> {
    if (redisAvailable && redis) {
      return redis.decr(key);
    }
    const entry = memoryStore.get(key);
    const current = entry ? parseInt(entry.value, 10) : 0;
    const next = current - 1;
    memoryStore.set(key, { value: next.toString(), expiresAt: entry?.expiresAt || Date.now() + 3600_000 });
    return next;
  },

  // OTP helpers
  async storeOtp(phone: string, otp: string): Promise<void> {
    await this.setWithExpiry(`otp:${phone}`, otp, 300);
  },

  async getOtp(phone: string): Promise<string | null> {
    return this.get(`otp:${phone}`);
  },

  async deleteOtp(phone: string): Promise<void> {
    await this.del(`otp:${phone}`);
  },

  // Quiz participant count cache
  async getQuizParticipantCount(quizId: string): Promise<number | null> {
    const count = await this.get(`quiz:${quizId}:participants`);
    return count ? parseInt(count, 10) : null;
  },

  async setQuizParticipantCount(quizId: string, count: number): Promise<void> {
    await this.setWithExpiry(`quiz:${quizId}:participants`, count.toString(), 3600);
  },

  async incrementQuizParticipantCount(quizId: string): Promise<number> {
    if (redisAvailable && redis) {
      return redis.incr(`quiz:${quizId}:participants`);
    }
    return this.increment(`quiz:${quizId}:participants`);
  },
};

export { redis, redisAvailable };
