"use server"

import { redirect } from "next/navigation"
import { db } from "@/prisma/db" // adjust path

export async function createProject(repoUrl: string) {
  const name = repoUrl
    .replace(/\.git$/, "")
    .split("/")
    .pop()!
  const slug = name.toLowerCase().replace(/[^a-z0-9-]/g, "-")

  const newDeployment = await db.orm.public.Deployment.create({
    status: "QUEUED",
    slug,
  })

  const project = await db.orm.public.Project.create({
    name,
    slug,
    repoUrl,
    activeDeploymentId: newDeployment.id,
  })

  // TODO: create the first Deployment (status QUEUED) and kick off the build here

  redirect(`/projects/${project.slug}`)
}
