import { toProjectWithActive } from "@/lib/server/db/mappers"
import type { ProjectWithActive } from "@/lib/types"
import { db } from "@/prisma/db"
import { keyForProject, cache, PROJECT_CACHE_TTL_SECONDS } from "."

export async function getCachedProject(
  slug: string
): Promise<ProjectWithActive | undefined> {
  try {
    const value = await cache().get(keyForProject(slug))
    if (!value) {
      console.log(`[project-cache] cache miss for project ${slug}`)
      return undefined
    }
    const project = JSON.parse(value) as ProjectWithActive
    console.log(`[project-cache] cache hit for project ${slug}`)
    return project
  } catch (err) {
    console.error("[project-cache] could not read cache", err)
    return undefined
  }
}

export async function cacheProject(
  slug: string,
  project: ProjectWithActive
): Promise<void> {
  try {
    await cache().set(
      keyForProject(slug),
      JSON.stringify(project),
      "EX",
      PROJECT_CACHE_TTL_SECONDS
    )
  } catch (err) {
    console.error("[project-cache] could not write cache", err)
  }
}

export async function invalidateProjectCache(slug: string): Promise<void> {
  try {
    await cache().del(keyForProject(slug))
  } catch (err) {
    console.error("[project-cache] could not invalidate cache", err)
  }
}

export async function refreshProjectCacheById(
  projectId: string
): Promise<void> {
  const project = await db.orm.public.Project.where({ id: projectId }).first()
  if (!project) return
  const deployments = await db.orm.public.Deployment.where({
    projectId,
  }).all()
  await cacheProject(project.slug, toProjectWithActive(project, deployments))
}
