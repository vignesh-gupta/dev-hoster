import { NextRequest, NextResponse } from "next/server"
import { db } from "@/prisma/db"

export async function GET(
  _req: NextRequest,
  ctx: RouteContext<"/api/projects/[slug]/deployments/[deploymentSlug]">
): Promise<NextResponse> {
  const { slug, deploymentSlug } = await ctx.params
  const project = await db.orm.public.Project.where({
    slug,
  }).first()
  if (!project)
    return NextResponse.json({ error: "project not found" }, { status: 404 })

  const deployment = await db.orm.public.Deployment.where({
    projectId: project.id,
    slug: deploymentSlug,
  }).first()
  if (!deployment)
    return NextResponse.json({ error: "deployment not found" }, { status: 404 })

  return NextResponse.json({ project, deployment })
}
