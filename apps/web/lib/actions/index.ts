"use server"

import { redirect } from "next/navigation"
import { db } from "@/prisma/db"
import { generateDeploymentSlug, generateUniqueProjectSlug } from "@/lib/slug"

export async function createProject(repoUrl: string) {
  const name = repoUrl
    .replace(/\.git$/, "")
    .split("/")
    .pop()!
  const slug = await generateUniqueProjectSlug(name)
  const newDeploymentSlug = await generateDeploymentSlug(slug, "initial-commit")

  const result = await db.transaction(async (tx) => {
    const project = await tx.orm.public.Project.create({
      name,
      slug,
      repoUrl,
      activeDeploymentId: null,
    })
    const newDeployment = await tx.orm.public.Deployment.create({
      status: "QUEUED",
      slug: newDeploymentSlug,
      projectId: project.id,
    })

    await tx.orm.public.Project.where({ id: project.id }).update({
      activeDeploymentId: newDeployment.id,
    })

    return { project, newDeployment }
  })

  // TODO: create the first Deployment (status QUEUED) and kick off the build here

  redirect(`/projects/${result.project.slug}`)
}
