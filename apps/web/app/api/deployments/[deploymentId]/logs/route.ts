import { NextRequest } from "next/server";
import Redis from "ioredis";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: { deploymentId: string } }
) {
  const subscriber = new Redis(process.env.REDIS_URL!);
  const channel = `logs:${params.deploymentId}`;

  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();
      const send = (line: string) => {
        controller.enqueue(encoder.encode(`data: ${line}\n\n`));
      };

      subscriber.subscribe(channel);
      subscriber.on("message", (_channel, message) => send(message));

      req.signal.addEventListener("abort", () => {
        subscriber.unsubscribe(channel);
        subscriber.quit();
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
