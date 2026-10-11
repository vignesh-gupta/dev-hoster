// TODO-remove-last: persisted build logs + in-process pub/sub that stands in
// for the Redis `logs:<deploymentId>` channel used by the real builder.
import { EventEmitter } from "node:events"
import type { LogEvent, LogLevel, LogLine } from "@/lib/types"
import { mutate, now, readCollection } from "./store"

type LogMap = Record<string, LogLine[]>

const g = globalThis as unknown as { __mockLogBus?: EventEmitter }
const bus = (g.__mockLogBus ??= new EventEmitter().setMaxListeners(0))

export async function getLogs(deploymentId: string): Promise<LogLine[]> {
  const all = await readCollection<LogMap>("logs")
  return all[deploymentId] ?? []
}

export async function clearLogs(deploymentId: string) {
  await mutate<LogMap, void>("logs", (all) => {
    delete all[deploymentId]
  })
}

export async function appendLog(
  deploymentId: string,
  message: string,
  level: LogLevel = "info"
) {
  const line: LogLine = { ts: now(), level, message }
  await mutate<LogMap, void>("logs", (all) => {
    ;(all[deploymentId] ??= []).push(line)
  })
  bus.emit(deploymentId, { type: "log", ...line } satisfies LogEvent)
}

export function publishEvent(deploymentId: string, event: LogEvent) {
  bus.emit(deploymentId, event)
}

export function subscribeLogs(
  deploymentId: string,
  listener: (event: LogEvent) => void
) {
  bus.on(deploymentId, listener)
  return () => {
    bus.off(deploymentId, listener)
  }
}
