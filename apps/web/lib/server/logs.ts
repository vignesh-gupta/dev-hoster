import Redis from "ioredis"
import type { LogEvent, LogLevel } from "@/lib/types"
import { requireEnv } from "@/lib/server/config"

/*
 * Build logs travel over Redis. The builder container publishes every event to
 * the channel `logs:<deploymentId>` and also appends it to the list
 * `logs-history:<deploymentId>` so a page opened later can replay the build.
 * Both use the same JSON payload:
 *   { deploymentId, timestamp, type: "log", message } | { ..., type: "status", status }
 */

const HISTORY_TTL_SECONDS = 60 * 60 * 24 * 7

export const channelFor = (deploymentId: string) => `logs:${deploymentId}`
export const historyKeyFor = (deploymentId: string) =>
  `logs-history:${deploymentId}`

// Shared connection for commands (publish / LRANGE); survives HMR.
const g = globalThis as unknown as { __redisCmd?: Redis }
function commands(): Redis {
  return (g.__redisCmd ??= new Redis(requireEnv("REDIS_URL"), {
    maxRetriesPerRequest: 2,
  }))
}

/** A fresh connection: a subscribed Redis client can run no other commands. */
export function createSubscriber(): Redis {
  return new Redis(requireEnv("REDIS_URL"), { maxRetriesPerRequest: 2 })
}

function levelOf(message: string): LogLevel {
  if (/^error\b/i.test(message)) return "error"
  if (/^warn/i.test(message)) return "warn"
  return "info"
}

/** Normalises a raw builder payload into the shape the UI consumes. */
export function toLogEvent(raw: string): LogEvent | null {
  try {
    const e = JSON.parse(raw) as {
      type?: string
      message?: string
      status?: string
      timestamp?: string
      level?: LogLevel
    }
    if (e.type === "log" && typeof e.message === "string") {
      return {
        type: "log",
        ts: e.timestamp ?? new Date().toISOString(),
        level: e.level ?? levelOf(e.message),
        message: e.message,
      }
    }
    if (e.type === "status" && typeof e.status === "string") {
      return { type: "status", status: e.status as never }
    }
  } catch {
    // not JSON: ignore
  }
  return null
}

/** Stored events for a deployment, oldest first (raw JSON strings). */
export function getHistory(deploymentId: string): Promise<string[]> {
  return commands().lrange(historyKeyFor(deploymentId), 0, -1)
}

/** Publishes an event the same way the builder does (history + live channel). */
export async function publishEvent(
  deploymentId: string,
  event:
    | { type: "log"; message: string }
    | { type: "status"; status: string }
) {
  const payload = JSON.stringify({
    deploymentId,
    timestamp: new Date().toISOString(),
    ...event,
  })
  const key = historyKeyFor(deploymentId)
  await commands()
    .multi()
    .rpush(key, payload)
    .expire(key, HISTORY_TTL_SECONDS)
    .publish(channelFor(deploymentId), payload)
    .exec()
}

export async function clearHistory(deploymentId: string) {
  await commands().del(historyKeyFor(deploymentId))
}
