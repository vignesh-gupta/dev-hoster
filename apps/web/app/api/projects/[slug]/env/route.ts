import type { NextRequest } from "next/server"
import { envVarInputSchema } from "@/lib/schemas"
import { createEnvVars, listEnvVars } from "@/lib/server/data"
import { requireProject } from "@/lib/server/guards"
import { handle, ok, parseBody } from "@/lib/server/http"
import { maskEnvVar } from "@/lib/server/mask"

export const dynamic = "force-dynamic"

export async function GET(
  _req: NextRequest,
  ctx: RouteContext<"/api/projects/[slug]/env">
) {
  return handle(async () => {
    const { slug } = await ctx.params
    const project = await requireProject(slug)
    return ok((await listEnvVars(project.id)).map(maskEnvVar))
  })
}

export async function POST(
  req: NextRequest,
  ctx: RouteContext<"/api/projects/[slug]/env">
) {
  return handle(async () => {
    const { slug } = await ctx.params
    const project = await requireProject(slug)
    const input = await parseBody(req, envVarInputSchema)
    const [created] = await createEnvVars(project.id, [input])
    return ok(maskEnvVar(created!), 201)
  })
}
