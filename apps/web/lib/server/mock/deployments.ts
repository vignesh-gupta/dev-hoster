// TODO-remove-last: mock deployment repository (reads/writes temp/deployments.json).
// Replaces the Prisma queries + ECS RunTask (lib/queue-build.ts) used by the real pipeline.
import { randomBytes, randomUUID } from "node:crypto"
import type { CreateDeploymentInput } from "@/lib/schemas"
import { deploymentSlug } from "@/lib/slug"
import type {
  Deployment,
  DeploymentStatus,
  DeploymentWithProject,
  Project,
} from "@/lib/types"
import { isTerminalStatus } from "@/lib/types"
import { cancelRunner, ensureRunner } from "./builder"
import { appendLog, publishEvent } from "./logs"
import { mutate, now, readCollection } from "./store"

const COMMIT_MESSAGES = [
  "feat: improve onboarding flow",
  "fix: handle empty state on dashboard",
  "chore: update dependencies",
  "refactor: extract shared hooks",
  "docs: clarify setup instructions",
  "perf: lazy-load heavy components",
  "style: tweak spacing and colors",
]

export async function getDeploymentById(id: string) {
  const all = await readCollection<Deployment[]>("deployments")
  return all.find((d) => d.id === id) ?? null
}

export async function getDeploymentBySlug(projectId: string, slug: string) {
  const all = await readCollection<Deployment[]>("deployments")
  return all.find((d) => d.projectId === projectId && d.slug === slug) ?? null
}

export async function listDeployments(
  filter: {
    projectId?: string
    status?: DeploymentStatus
    branch?: string
    limit?: number
  } = {}
): Promise<DeploymentWithProject[]> {
  const [deployments, projects] = await Promise.all([
    readCollection<Deployment[]>("deployments"),
    readCollection<Project[]>("projects"),
  ])
  const byId = new Map(projects.map((p) => [p.id, p]))
  return deployments
    .filter((d) => !filter.projectId || d.projectId === filter.projectId)
    .filter((d) => !filter.status || d.status === filter.status)
    .filter((d) => !filter.branch || d.branch === filter.branch)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, filter.limit ?? undefined)
    .flatMap((d) => {
      const p = byId.get(d.projectId)
      return p
        ? [
            {
              ...d,
              project: { id: p.id, name: p.name, slug: p.slug },
              isActive: p.activeDeploymentId === d.id,
            },
          ]
        : []
    })
}

/** Creates a QUEUED deployment and kicks off the simulated build. */
export async function createDeployment(
  project: Project,
  input: CreateDeploymentInput
): Promise<Deployment> {
  const commitSha = input.commitSha ?? randomBytes(20).toString("hex")
  const deployment = await mutate<Deployment[], Deployment>(
    "deployments",
    (all) => {
      const ts = now()
      const created: Deployment = {
        id: randomUUID(),
        projectId: project.id,
        slug: deploymentSlug(commitSha, (s) =>
          all.some((d) => d.projectId === project.id && d.slug === s)
        ),
        commitSha,
        commitMessage:
          COMMIT_MESSAGES[Math.floor(Math.random() * COMMIT_MESSAGES.length)]!,
        branch: input.branch ?? project.branch,
        status: "QUEUED",
        s3Path: null,
        createdAt: ts,
        updatedAt: ts,
        startedAt: null,
        finishedAt: null,
      }
      all.push(created)
      return created
    }
  )
  ensureRunner(deployment.id)
  return deployment
}

/**
 * Applies a status transition (shared by the simulated builder and the real
 * builder's PATCH callback). Only READY flips Project.activeDeploymentId.
 */
export async function updateDeploymentStatus(
  id: string,
  status: DeploymentStatus,
  s3Path?: string
): Promise<Deployment | null> {
  const ts = now()
  const updated = await mutate<Deployment[], Deployment | null>(
    "deployments",
    (all) => {
      const d = all.find((x) => x.id === id)
      if (!d) return null
      d.status = status
      d.updatedAt = ts
      if (status === "BUILDING") d.startedAt = ts
      if (isTerminalStatus(status)) d.finishedAt = ts
      if (status === "READY" && s3Path) d.s3Path = s3Path
      return d
    }
  )
  if (!updated) return null

  if (status === "READY") {
    await mutate<Project[], void>("projects", (all) => {
      const p = all.find((x) => x.id === updated.projectId)
      if (p) {
        p.activeDeploymentId = updated.id
        p.updatedAt = ts
      }
    })
  }
  publishEvent(id, { type: "status", status })
  return updated
}

/** Rollback / promote: make an already-built deployment the live one. */
export async function promoteDeployment(
  deployment: Deployment
): Promise<boolean> {
  if (deployment.status !== "READY") return false
  await mutate<Project[], void>("projects", (all) => {
    const p = all.find((x) => x.id === deployment.projectId)
    if (p) {
      p.activeDeploymentId = deployment.id
      p.updatedAt = now()
    }
  })
  return true
}

export async function cancelDeployment(
  deployment: Deployment
): Promise<Deployment | null> {
  if (isTerminalStatus(deployment.status)) return deployment
  cancelRunner(deployment.id)
  await appendLog(deployment.id, "Build canceled by user", "error")
  return updateDeploymentStatus(deployment.id, "FAILED")
}
