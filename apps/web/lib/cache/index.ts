import Redis from "ioredis"
import { requireEnv } from "../server/config"

const g = globalThis as unknown as { __cacheRedis?: Redis }

export function cache(): Redis {
  return (g.__cacheRedis ??= new Redis(requireEnv("REDIS_URL"), {
    maxRetriesPerRequest: 2,
  }))
}


export const PROJECT_CACHE_TTL_SECONDS = 60
export const keyForProject = (slug: string) => `project:${slug}`

export * from "./project"