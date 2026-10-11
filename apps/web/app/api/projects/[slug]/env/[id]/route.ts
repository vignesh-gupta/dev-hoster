import type { NextRequest } from "next/server"
import { updateEnvVarSchema } from "@/lib/schemas"
import { deleteEnvVar, updateEnvVar } from "@/lib/server/data"
import { requireProject } from "@/lib/server/guards"
import { handle, noContent, notFound, ok, parseBody } from "@/lib/server/http"
import { maskEnvVar } from "@/lib/server/mask"

export const dynamic = "force-dynamic"

export async function PATCH(
  req: NextRequest,
  ctx: RouteContext<"/api/projects/[slug]/env/[id]">
) {
  return handle(async () => {
    const { slug, id } = await ctx.params
    const project = await requireProject(slug)
    const patch = await parseBody(req, updateEnvVarSchema)
    const env = await updateEnvVar(project.id, id, patch)
    if (!env) throw notFound("Environment variable")
    return ok(maskEnvVar(env))
  })
}

export async function DELETE(
  _req: NextRequest,
  ctx: RouteContext<"/api/projects/[slug]/env/[id]">
) {
  return handle(async () => {
    const { slug, id } = await ctx.params
    const project = await requireProject(slug)
    if (!(await deleteEnvVar(project.id, id)))
      throw notFound("Environment variable")
    return noContent()
  })
}
