/**
 * Cache Service - Redis caching for chat history and responses
 */
import Redis from 'ioredis';

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
let redis: Redis | null = null;
let redisConnected = false;
let errorLogged = false;

// Initialize Redis connection
export function initializeCache() {
    try {
        redis = new Redis(redisUrl, {
            retryStrategy: (times) => {
                const delay = Math.min(times * 50, 2000);
                return delay;
            },
            maxRetriesPerRequest: null,
            enableReadyCheck: false,
            enableOfflineQueue: false,
        });

        redis.on('connect', () => {
            redisConnected = true;
            errorLogged = false;
            console.log('✓ Redis cache connected');
        });

        redis.on('error', (err) => {
            // Only log Redis error once to avoid spam
            if (!errorLogged) {
                console.log('ℹ️  Redis unavailable - cache disabled (database will be used instead)');
                errorLogged = true;
            }
        });

        redis.on('close', () => {
            redisConnected = false;
        });
    } catch (error) {
        // Silently fail - Redis is optional
        redis = null;
    }
}

/**
 * Get cached value
 */
export async function getCache(key: string): Promise<string | null> {
    if (!redis || !redisConnected) return null;

    try {
        const value = await redis.get(key);
        if (value) {
            console.log('✓ Cache hit:', key);
        }
        return value;
    } catch (error) {
        // Silently fail on cache operations
        return null;
    }
}

/**
 * Set cached value with expiration (default 24 hours)
 */
export async function setCache(key: string, value: string, expirationSeconds = 86400): Promise<boolean> {
    if (!redis || !redisConnected) return false;

    try {
        await redis.setex(key, expirationSeconds, value);
        console.log('✓ Cache set:', key);
        return true;
    } catch (error) {
        // Silently fail on cache operations
        return false;
    }
}

/**
 * Delete cached value
 */
export async function deleteCache(key: string): Promise<boolean> {
    if (!redis || !redisConnected) return false;

    try {
        await redis.del(key);
        return true;
    } catch (error) {
        // Silently fail on cache operations
        return false;
    }
}

/**
 * Get conversation cache key
 */
export function getCacheKey(conversationId: string): string {
    return `conversation:${conversationId}`;
}

/**
 * Get conversation history from cache
 */
export async function getCachedHistory(conversationId: string): Promise<any | null> {
    const cached = await getCache(getCacheKey(conversationId));
    return cached ? JSON.parse(cached) : null;
}

/**
 * Cache conversation history
 */
export async function cacheHistory(conversationId: string, history: any): Promise<boolean> {
    return setCache(getCacheKey(conversationId), JSON.stringify(history), 86400);
}

/**
 * Disconnect Redis
 */
export async function disconnectCache(): Promise<void> {
    if (redis) {
        await redis.quit();
        redis = null;
        console.log('Redis cache disconnected');
    }
}
