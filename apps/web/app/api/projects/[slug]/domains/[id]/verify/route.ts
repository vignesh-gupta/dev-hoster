import type { NextRequest } from "next/server"
import { verifyDomain } from "@/lib/server/data"
import { requireProject } from "@/lib/server/guards"
import { handle, notFound, ok } from "@/lib/server/http"

export const dynamic = "force-dynamic"

export async function POST(
  _req: NextRequest,
  ctx: RouteContext<"/api/projects/[slug]/domains/[id]/verify">
) {
  return handle(async () => {
    const { slug, id } = await ctx.params
    const project = await requireProject(slug)
    const domain = await verifyDomain(project.id, id)
    if (!domain) throw notFound("Domain")
    return ok(domain)
  })
}
