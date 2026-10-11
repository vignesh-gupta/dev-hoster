import type { NextRequest } from "next/server"
import { createDomainSchema } from "@/lib/schemas"
import { createDomain, listDomains, previewDomain } from "@/lib/server/data"
import { requireProject } from "@/lib/server/guards"
import { handle, ok, parseBody } from "@/lib/server/http"
import type { DomainsResponse } from "@/lib/types"

export const dynamic = "force-dynamic"

export async function GET(
  _req: NextRequest,
  ctx: RouteContext<"/api/projects/[slug]/domains">
) {
  return handle(async () => {
    const { slug } = await ctx.params
    const project = await requireProject(slug)
    return ok<DomainsResponse>({
      primary: `${project.slug}.${previewDomain()}`,
      domains: await listDomains(project.id),
    })
  })
}

export async function POST(
  req: NextRequest,
  ctx: RouteContext<"/api/projects/[slug]/domains">
) {
  return handle(async () => {
    const { slug } = await ctx.params
    const project = await requireProject(slug)
    const { hostname } = await parseBody(req, createDomainSchema)
    return ok(await createDomain(project.id, hostname), 201)
  })
}
