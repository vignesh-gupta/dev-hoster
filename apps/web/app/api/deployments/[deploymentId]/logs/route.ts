import type { NextRequest } from "next/server"
import {
  ensureRunner,
  getDeploymentById,
  getLogs,
  subscribeLogs,
} from "@/lib/server/data"
import { handle, notFound } from "@/lib/server/http"
import { isTerminalStatus, type LogEvent } from "@/lib/types"

export const dynamic = "force-dynamic"

/**
 * SSE stream of build logs. Replays the stored lines first, then streams live
 * `log` / `status` events and closes once the deployment is READY or FAILED.
 */
export async function GET(
  req: NextRequest,
  ctx: RouteContext<"/api/deployments/[deploymentId]/logs">
) {
  return handle(async () => {
    const { deploymentId } = await ctx.params
    const deployment = await getDeploymentById(deploymentId)
    if (!deployment) throw notFound("Deployment")
    if (!isTerminalStatus(deployment.status)) ensureRunner(deploymentId)

    const encoder = new TextEncoder()
    let cleanup = () => {}

    const stream = new ReadableStream({
      async start(controller) {
        let closed = false
        const seen = new Set<string>()
        const lineKey = (e: { ts: string; message: string }) =>
          `${e.ts}|${e.message}`

        const close = () => {
          if (closed) return
          closed = true
          cleanup()
          try {
            controller.close()
          } catch {}
        }
        const send = (event: LogEvent) => {
          if (closed) return
          if (event.type === "log") {
            const key = lineKey(event)
            if (seen.has(key)) return
            seen.add(key)
          }
          controller.enqueue(
            encoder.encode(
              `event: ${event.type}\ndata: ${JSON.stringify(event)}\n\n`
            )
          )
          if (event.type === "status" && isTerminalStatus(event.status)) close()
        }

        // Subscribe before replaying so no line is missed. Live events that arrive
        // mid-replay are held back and flushed afterwards so order is preserved;
        // `seen` de-dupes any overlap with the stored lines.
        let replaying = true
        const held: LogEvent[] = []
        const unsubscribe = subscribeLogs(deploymentId, (event) =>
          replaying ? held.push(event) : send(event)
        )
        const keepAlive = setInterval(() => {
          if (!closed) controller.enqueue(encoder.encode(": ping\n\n"))
        }, 15_000)
        cleanup = () => {
          unsubscribe()
          clearInterval(keepAlive)
        }
        req.signal.addEventListener("abort", close)

        for (const line of await getLogs(deploymentId)) {
          send({ type: "log", ...line })
        }
        replaying = false
        held.forEach(send)
        const current = await getDeploymentById(deploymentId)
        if (current) send({ type: "status", status: current.status })
      },
      cancel() {
        cleanup()
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
