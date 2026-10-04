"use server"

import { redirect } from "next/navigation"
import { db } from "@/prisma/db"
import { generateDeploymentSlug, generateUniqueProjectSlug } from "@/lib/slug"
import { queueBuild } from "@/lib/queue-build"
import { Temporal } from "temporal-polyfill"

export async function createProject(repoUrl: string) {
  const name = repoUrl
    .replace(/\.git$/, "")
    .split("/")
    .pop()!
  const slug = await generateUniqueProjectSlug(name)
  const result = await db.transaction(async (tx) => {
    const project = await tx.orm.public.Project.create({
      name,
      slug,
      repoUrl,
      activeDeploymentId: null,
    })
    const newDeploymentSlug = await generateDeploymentSlug(
      project.id,
      "initial-commit"
    )
    const newDeployment = await tx.orm.public.Deployment.create({
      status: "QUEUED",
      slug: newDeploymentSlug,
      projectId: project.id,
    })

    return { project, newDeployment }
  })

  try {
    await queueBuild({
      projectId: result.project.id,
      deploymentId: result.newDeployment.id,
      repoUrl,
    })
  } catch (err) {
    console.error("Failed to queue build", err)
    await db.orm.public.Deployment.where({ id: result.newDeployment.id }).update({
      status: "FAILED",
      finishedAt: Temporal.Now.instant(),
    })
  }

  redirect(`/projects/${result.project.slug}/${result.newDeployment.slug}`)
}
