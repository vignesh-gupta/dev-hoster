import { NextRequest } from "next/server"
import Redis from "ioredis"

export const dynamic = "force-dynamic"

export async function GET(
  req: NextRequest,
  ctx: RouteContext<"/api/deployments/[deploymentId]/logs">
) {
  const { deploymentId } = await ctx.params
  const subscriber = new Redis(process.env.REDIS_URL!)
  const channel = `logs:${deploymentId}`

  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder()
      let closed = false

      const send = (line: string) => {
        if (closed) return

        try {
          const event = JSON.parse(line)
          const type = typeof event.type === "string" ? event.type : "message"
          controller.enqueue(
            encoder.encode(`event: ${type}\ndata: ${JSON.stringify(event)}\n\n`)
          )
        } catch {
          controller.enqueue(encoder.encode(`data: ${line}\n\n`))
        }
      }

      subscriber.subscribe(channel)
      subscriber.on("message", (_channel, message) => send(message))

      req.signal.addEventListener("abort", () => {
        closed = true
        subscriber.unsubscribe(channel)
        subscriber.quit()
        controller.close()
      })
    },
  })

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  })
}
