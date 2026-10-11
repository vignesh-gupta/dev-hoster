import type { NextRequest } from "next/server"
import { promoteDeployment } from "@/lib/server/data"
import { requireDeployment } from "@/lib/server/guards"
import { HttpError, handle, ok } from "@/lib/server/http"

export const dynamic = "force-dynamic"

/** Makes a READY deployment the live one (instant rollback / promote). */
export async function POST(
  _req: NextRequest,
  ctx: RouteContext<"/api/projects/[slug]/deployments/[deploymentSlug]/promote">
) {
  return handle(async () => {
    const { slug, deploymentSlug } = await ctx.params
    const { deployment } = await requireDeployment(slug, deploymentSlug)
    if (!(await promoteDeployment(deployment)))
      throw new HttpError(
        409,
        "Only a READY deployment can be promoted",
        "invalid_state"
      )
    return ok({ ok: true })
  })
}
