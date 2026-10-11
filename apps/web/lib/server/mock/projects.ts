// TODO-remove-last: mock project repository (reads/writes temp/projects.json).
import { randomUUID } from "node:crypto"
import type { CreateProjectInput, UpdateProjectInput } from "@/lib/schemas"
import { createProjectSchema } from "@/lib/schemas"
import {
  projectNameFromRepoUrl,
  slugifyProjectName,
  uniqueSlug,
} from "@/lib/slug"
import type { Deployment, Project, ProjectWithActive } from "@/lib/types"
import { cancelRunner } from "./builder"
import { createDeployment } from "./deployments"
import { createEnvVars } from "./env-vars"
import { mutate, now, readCollection } from "./store"

export const previewDomain = () =>
  process.env.PREVIEW_DOMAIN ?? "localhost:8000"

export const projectUrl = (slug: string) =>
  `http://${slug}.${previewDomain()}`

function decorate(
  project: Project,
  deployments: Deployment[]
): ProjectWithActive {
  const mine = deployments
    .filter((d) => d.projectId === project.id)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  return {
    ...project,
    activeDeployment:
      mine.find((d) => d.id === project.activeDeploymentId) ?? null,
    latestDeployment: mine[0] ?? null,
    url: projectUrl(project.slug),
  }
}

export async function getProjectById(id: string): Promise<Project | null> {
  const projects = await readCollection<Project[]>("projects")
  return projects.find((p) => p.id === id) ?? null
}

export async function listProjects(): Promise<ProjectWithActive[]> {
  const [projects, deployments] = await Promise.all([
    readCollection<Project[]>("projects"),
    readCollection<Deployment[]>("deployments"),
  ])
  return projects
    .map((p) => decorate(p, deployments))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

export async function getProjectBySlug(
  slug: string
): Promise<ProjectWithActive | null> {
  const [projects, deployments] = await Promise.all([
    readCollection<Project[]>("projects"),
    readCollection<Deployment[]>("deployments"),
  ])
  const project = projects.find((p) => p.slug === slug)
  return project ? decorate(project, deployments) : null
}

/** Creates the project, its env vars and the first (queued) deployment. */
export async function createProject(
  rawInput: CreateProjectInput,
  userId: number
): Promise<{ project: ProjectWithActive; deployment: Deployment }> {
  const input = createProjectSchema.parse(rawInput)
  const name = input.name ?? projectNameFromRepoUrl(input.repoUrl)
  const ts = now()

  const project = await mutate<Project[], Project>("projects", (all) => {
    const slug = uniqueSlug(slugifyProjectName(name), (s) =>
      all.some((p) => p.slug === s)
    )
    const created: Project = {
      id: randomUUID(),
      name,
      slug,
      repoUrl: input.repoUrl,
      branch: input.branch,
      framework: input.framework,
      installCommand: input.installCommand,
      buildCommand: input.buildCommand,
      outputDir: "dist",
      userId,
      activeDeploymentId: null,
      createdAt: ts,
      updatedAt: ts,
    }
    all.push(created)
    return created
  })

  await createEnvVars(project.id, input.envVars)
  const deployment = await createDeployment(project, {})
  const decorated = (await getProjectBySlug(project.slug))!
  return { project: decorated, deployment }
}

export async function updateProject(
  slug: string,
  patch: UpdateProjectInput
): Promise<ProjectWithActive | null> {
  const updated = await mutate<Project[], Project | null>("projects", (all) => {
    const p = all.find((x) => x.slug === slug)
    if (!p) return null
    Object.assign(p, patch, { updatedAt: now() })
    return p
  })
  return updated ? getProjectBySlug(updated.slug) : null
}

/** Deletes the project and everything hanging off it. Returns false if missing. */
export async function deleteProject(slug: string): Promise<boolean> {
  const removed = await mutate<Project[], Project | null>("projects", (all) => {
    const i = all.findIndex((p) => p.slug === slug)
    return i === -1 ? null : all.splice(i, 1)[0]!
  })
  if (!removed) return false

  const removedDeploymentIds = await mutate<Deployment[], string[]>(
    "deployments",
    (all) => {
      const ids = all.filter((d) => d.projectId === removed.id).map((d) => d.id)
      for (let i = all.length - 1; i >= 0; i--) {
        if (all[i]!.projectId === removed.id) all.splice(i, 1)
      }
      return ids
    }
  )
  removedDeploymentIds.forEach(cancelRunner)

  const dropByProject = (all: { projectId: string }[]) => {
    for (let i = all.length - 1; i >= 0; i--)
      if (all[i]!.projectId === removed.id) all.splice(i, 1)
  }
  await Promise.all([
    mutate<Record<string, unknown>, void>("logs", (logs) => {
      removedDeploymentIds.forEach((id) => delete logs[id])
    }),
    mutate<{ projectId: string }[], void>("env-vars", dropByProject),
    mutate<{ projectId: string }[], void>("domains", dropByProject),
  ])
  return true
}
