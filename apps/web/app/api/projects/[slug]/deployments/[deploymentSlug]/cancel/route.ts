import type { NextRequest } from "next/server"
import { cancelDeployment } from "@/lib/server/data"
import { requireDeployment } from "@/lib/server/guards"
import { handle, ok } from "@/lib/server/http"

export const dynamic = "force-dynamic"

/** Stops a QUEUED / BUILDING deployment (marks it FAILED). */
export async function POST(
  _req: NextRequest,
  ctx: RouteContext<"/api/projects/[slug]/deployments/[deploymentSlug]/cancel">
) {
  return handle(async () => {
    const { slug, deploymentSlug } = await ctx.params
    const { deployment } = await requireDeployment(slug, deploymentSlug)
    return ok(await cancelDeployment(deployment))
  })
}
