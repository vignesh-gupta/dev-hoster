import { DeploymentList } from "@/components/deployment-list"
import { DeploymentStatusBadge } from "@/components/deployment-status-badge"
import { db } from "@/prisma/db"
import { notFound } from "next/navigation"

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  const project = await db.orm.public.Project.where({ slug })
    .include("deployments", (d) => d.orderBy((x) => x.createdAt.desc()))
    .include("activeDeployment")
    .first()

  if (!project) notFound()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-medium">{project.name}</h1>
          <p className="text-sm text-muted-foreground">{project.repoUrl}</p>
        </div>
        {project.activeDeployment && (
          <DeploymentStatusBadge status={project.activeDeployment.status} />
        )}
      </div>

      <div>
        <h2 className="mb-3 text-sm font-medium text-muted-foreground">
          Deployments
        </h2>
        <DeploymentList
          projectSlug={project.slug}
          deployments={JSON.parse(JSON.stringify(project.deployments))}
        />
      </div>
    </div>
  )
}
