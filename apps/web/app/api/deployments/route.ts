import type { NextRequest } from "next/server"
import { deploymentsQuerySchema } from "@/lib/schemas"
import { listDeployments } from "@/lib/server/data"
import { handle, ok, parseQuery } from "@/lib/server/http"

export const dynamic = "force-dynamic"

/** Deployments across every project, newest first. */
export async function GET(req: NextRequest) {
  return handle(async () =>
    ok(await listDeployments(parseQuery(req, deploymentsQuerySchema)))
  )
}
