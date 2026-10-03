import { db } from "../prisma/db"

export function slugifyProjectName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
}

export async function generateUniqueProjectSlug(name: string): Promise<string> {
  const base = slugifyProjectName(name)
  let candidate = base
  let attempt = 0

  while (await db.orm.public.Project.where({ slug: candidate }).first()) {
    attempt += 1
    candidate = `${base}-${attempt}`
  }

  return candidate
}

// Vercel-style: a short hash from the commit, extended only on collision within
// the project. A redeploy of the exact same commit still gets a *new* deployment
// row, so we can't dedupe on commitSha alone -- the slug just needs to be unique
// per (projectId, slug), which the unique constraint in schema.prisma enforces.
export async function generateDeploymentSlug(
  projectId: string,
  commitSha: string
): Promise<string> {
  const base = commitSha.slice(0, 6)
  let candidate = base
  let suffix = 1

  while (
    await db.orm.public.Deployment.where({
      projectId: projectId,
      slug: candidate,
    }).first()
  ) {
    suffix += 1
    candidate = `${base}-${suffix}`
  }

  return candidate
}
