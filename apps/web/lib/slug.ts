export function slugifyProjectName(name: string): string {
  return (
    name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") || "project"
  )
}

/** Appends -1, -2, ... until `isTaken` says the candidate is free. */
export function uniqueSlug(base: string, isTaken: (slug: string) => boolean) {
  let candidate = base
  let n = 0
  while (isTaken(candidate)) {
    n += 1
    candidate = `${base}-${n}`
  }
  return candidate
}

// Vercel-style: a short hash from the commit, extended only on collision within
// the project. A redeploy of the exact same commit still gets a *new* deployment
// row, so the slug just needs to be unique per (projectId, slug).
export function deploymentSlug(
  commitSha: string,
  isTaken: (slug: string) => boolean
) {
  const base = commitSha.slice(0, 6)
  let candidate = base
  let suffix = 1
  while (isTaken(candidate)) {
    suffix += 1
    candidate = `${base}-${suffix}`
  }
  return candidate
}

export function projectNameFromRepoUrl(repoUrl: string) {
  return repoUrl.replace(/\/$/, "").replace(/\.git$/, "").split("/").pop()!
}
