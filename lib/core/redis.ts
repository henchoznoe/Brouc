/**
 * File: lib/core/redis.ts
 * Description: Redis client singleton for game state storage.
 * Author: Noé Henchoz
 * License: MIT
 * Copyright (c) 2026 Noé Henchoz
 */

import Redis from 'ioredis'

const createRedisClient = () => {
  const url = process.env.REDIS_URL ?? 'redis://localhost:6379'
  return new Redis(url, {
    maxRetriesPerRequest: 3,
    lazyConnect: true,
  })
}

type RedisInstance = ReturnType<typeof createRedisClient>

const globalForRedis = global as unknown as {
  redis: RedisInstance | undefined
}

const redis = globalForRedis.redis ?? createRedisClient()

if (process.env.NODE_ENV !== 'production') {
  globalForRedis.redis = redis
}

export default redis
