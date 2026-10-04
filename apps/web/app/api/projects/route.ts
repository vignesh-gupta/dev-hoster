import { NextRequest, NextResponse } from "next/server"
import { db } from "@/prisma/db"
import { generateUniqueProjectSlug } from "@/lib/slug"

export async function GET(): Promise<NextResponse> {
  const projects = await db.orm.public.Project.orderBy((p) =>
    p.createdAt.desc()
  ).all()

  return NextResponse.json(projects)
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const { name, repoUrl } = await req.json()

  if (!name || !repoUrl) {
    return NextResponse.json(
      { error: "name and repoUrl are required" },
      { status: 400 }
    )
  }

  const slug = await generateUniqueProjectSlug(name)
  const project = await db.orm.public.Project.create({
    name,
    repoUrl,
    slug,
  })

  return NextResponse.json(project, { status: 201 })
}
