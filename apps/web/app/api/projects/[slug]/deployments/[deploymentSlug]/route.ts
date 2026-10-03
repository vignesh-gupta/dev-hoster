import { NextRequest, NextResponse } from "next/server"
import { db } from "@/prisma/db"

export async function GET(
  _req: NextRequest,
  { params }: { params: { slug: string; deploymentSlug: string } }
): Promise<NextResponse> {
  const project = await db.orm.public.Project.where({
    slug: params.slug,
  }).first()
  if (!project)
    return NextResponse.json({ error: "project not found" }, { status: 404 })

  const deployment = await db.orm.public.Deployment.where({
    projectId: project.id,
    slug: params.deploymentSlug,
  }).first()
  if (!deployment)
    return NextResponse.json({ error: "deployment not found" }, { status: 404 })

  return NextResponse.json({ project, deployment })
}
