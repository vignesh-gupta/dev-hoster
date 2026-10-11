import type { NextRequest } from "next/server"
import { createDeploymentSchema, deploymentsQuerySchema } from "@/lib/schemas"
import { createDeployment, listDeployments } from "@/lib/server/data"
import { requireProject } from "@/lib/server/guards"
import { handle, ok, parseBody, parseQuery } from "@/lib/server/http"

export const dynamic = "force-dynamic"

export async function GET(
  req: NextRequest,
  ctx: RouteContext<"/api/projects/[slug]/deployments">
) {
  return handle(async () => {
    const { slug } = await ctx.params
    const project = await requireProject(slug)
    const query = parseQuery(req, deploymentsQuerySchema)
    return ok(await listDeployments({ ...query, projectId: project.id }))
  })
}

/** Triggers a new deployment (also used for redeploys). */
export async function POST(
  req: NextRequest,
  ctx: RouteContext<"/api/projects/[slug]/deployments">
) {
  return handle(async () => {
    const { slug } = await ctx.params
    const project = await requireProject(slug)
    const input = await parseBody(req, createDeploymentSchema)
    return ok(await createDeployment(project, input), 201)
  })
}
