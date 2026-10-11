import type { NextRequest } from "next/server"
import { deleteDomain } from "@/lib/server/data"
import { requireProject } from "@/lib/server/guards"
import { handle, noContent, notFound } from "@/lib/server/http"

export const dynamic = "force-dynamic"

export async function DELETE(
  _req: NextRequest,
  ctx: RouteContext<"/api/projects/[slug]/domains/[id]">
) {
  return handle(async () => {
    const { slug, id } = await ctx.params
    const project = await requireProject(slug)
    if (!(await deleteDomain(project.id, id))) throw notFound("Domain")
    return noContent()
  })
}
