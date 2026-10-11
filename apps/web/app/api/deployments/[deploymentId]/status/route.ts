import type { NextRequest } from "next/server"
import { builderStatusSchema } from "@/lib/schemas"
import { updateDeploymentStatus } from "@/lib/server/data"
import { HttpError, handle, notFound, ok, parseBody } from "@/lib/server/http"

export const dynamic = "force-dynamic"

/** Callback used by the builder container to report BUILDING / READY / FAILED. */
export async function PATCH(
  req: NextRequest,
  ctx: RouteContext<"/api/deployments/[deploymentId]/status">
) {
  return handle(async () => {
    const token = req.headers.get("x-builder-token")
    if (
      !process.env.BUILDER_CALLBACK_TOKEN ||
      token !== process.env.BUILDER_CALLBACK_TOKEN
    ) {
      throw new HttpError(401, "unauthorized", "unauthorized")
    }

    const { deploymentId } = await ctx.params
    const { status, ...extra } = await parseBody(req, builderStatusSchema)
    // Only READY flips Project.activeDeploymentId (handled in the data layer).
    const deployment = await updateDeploymentStatus(deploymentId, status, extra)
    if (!deployment) throw notFound("Deployment")
    return ok({ ok: true })
  })
}
