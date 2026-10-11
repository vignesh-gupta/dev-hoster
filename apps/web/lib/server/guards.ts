import { getDeploymentBySlug, getProjectBySlug } from "@/lib/server/data"
import { notFound } from "@/lib/server/http"

export async function requireProject(slug: string) {
  const project = await getProjectBySlug(slug)
  if (!project) throw notFound("Project")
  return project
}

export async function requireDeployment(
  projectSlug: string,
  deploymentSlug: string
) {
  const project = await requireProject(projectSlug)
  const deployment = await getDeploymentBySlug(project.id, deploymentSlug)
  if (!deployment) throw notFound("Deployment")
  return { project, deployment }
}
