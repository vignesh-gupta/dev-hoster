import type { NextRequest } from "next/server"
import {
  channelFor,
  createSubscriber,
  getDeploymentById,
  getHistory,
  toLogEvent,
} from "@/lib/server/data"
import { handle, notFound } from "@/lib/server/http"
import { isTerminalStatus, type LogEvent } from "@/lib/types"

export const dynamic = "force-dynamic"

/**
 * SSE stream of build logs. Replays the builder's stored events first, then
 * streams live `log` / `status` events from Redis and closes once the
 * deployment is READY or FAILED.
 */
export async function GET(
  req: NextRequest,
  ctx: RouteContext<"/api/deployments/[deploymentId]/logs">
) {
  return handle(async () => {
    const { deploymentId } = await ctx.params
    const deployment = await getDeploymentById(deploymentId)
    if (!deployment) throw notFound("Deployment")

    const encoder = new TextEncoder()
    const subscriber = createSubscriber()
    let closed = false
    let keepAlive: ReturnType<typeof setInterval> | undefined

    const stream = new ReadableStream({
      async start(controller) {
        const seen = new Set<string>()
        const held: string[] = []
        let replaying = true

        const close = () => {
          if (closed) return
          closed = true
          clearInterval(keepAlive)
          subscriber.quit().catch(() => subscriber.disconnect())
          try {
            controller.close()
          } catch {
            console.warn("[logs] stream already closed")
          }
        }
        const emit = (event: LogEvent) => {
          if (closed) return
          controller.enqueue(
            encoder.encode(
              `event: ${event.type}\ndata: ${JSON.stringify(event)}\n\n`
            )
          )
          if (event.type === "status" && isTerminalStatus(event.status)) close()
        }
        // Each payload is identical in history and on the channel, so the raw
        // string is a reliable de-dupe key for the replay/live overlap.
        const emitRaw = (raw: string) => {
          if (seen.has(raw)) return
          seen.add(raw)
          const event = toLogEvent(raw)
          if (event) emit(event)
        }

        req.signal.addEventListener("abort", close)
        keepAlive = setInterval(() => {
          if (!closed) controller.enqueue(encoder.encode(": ping\n\n"))
        }, 15_000)

        try {
          // Subscribe before replaying so nothing is missed; live events that
          // arrive mid-replay are held back to keep order.
          subscriber.on("message", (_channel, raw: string) =>
            replaying ? held.push(raw) : emitRaw(raw)
          )
          await subscriber.subscribe(channelFor(deploymentId))
          for (const raw of await getHistory(deploymentId)) emitRaw(raw)
          replaying = false
          held.forEach(emitRaw)
        } catch (err) {
          console.error("[logs] redis unavailable", err)
        }

        // The database is the source of truth for the final state.
        const current = await getDeploymentById(deploymentId)
        if (current) emit({ type: "status", status: current.status })
        if (current && isTerminalStatus(current.status)) close()
        // Redis down and still building: end the stream; the client retries.
        else if (subscriber.status !== "ready") close()
      },
      cancel() {
        closed = true
        clearInterval(keepAlive)
        subscriber.quit().catch(() => subscriber.disconnect())
      },
    })

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
      },
    })
  })
}
