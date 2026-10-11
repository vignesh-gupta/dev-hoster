import type { NextRequest } from "next/server"
import { updateProjectSchema } from "@/lib/schemas"
import { deleteProject, updateProject } from "@/lib/server/data"
import { requireProject } from "@/lib/server/guards"
import { handle, noContent, notFound, ok, parseBody } from "@/lib/server/http"

export const dynamic = "force-dynamic"

export async function GET(
  _req: NextRequest,
  ctx: RouteContext<"/api/projects/[slug]">
) {
  return handle(async () => {
    const { slug } = await ctx.params
    return ok(await requireProject(slug))
  })
}

export async function PATCH(
  req: NextRequest,
  ctx: RouteContext<"/api/projects/[slug]">
) {
  return handle(async () => {
    const { slug } = await ctx.params
    const patch = await parseBody(req, updateProjectSchema)
    const project = await updateProject(slug, patch)
    if (!project) throw notFound("Project")
    return ok(project)
  })
}

export async function DELETE(
  _req: NextRequest,
  ctx: RouteContext<"/api/projects/[slug]">
) {
  return handle(async () => {
    const { slug } = await ctx.params
    if (!(await deleteProject(slug))) throw notFound("Project")
    return noContent()
  })
}
