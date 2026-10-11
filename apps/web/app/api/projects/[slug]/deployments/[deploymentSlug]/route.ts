import type { NextRequest } from "next/server"
import { requireDeployment } from "@/lib/server/guards"
import { handle, ok } from "@/lib/server/http"

export const dynamic = "force-dynamic"

export async function GET(
  _req: NextRequest,
  ctx: RouteContext<"/api/projects/[slug]/deployments/[deploymentSlug]">
) {
  return handle(async () => {
    const { slug, deploymentSlug } = await ctx.params
    const { project, deployment } = await requireDeployment(slug, deploymentSlug)
    return ok({
      project,
      deployment: { ...deployment, isActive: project.activeDeploymentId === deployment.id },
    })
  })
}
