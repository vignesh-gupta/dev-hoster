import { BuildLogViewer } from "@/components/build-log-viewer"
import { DeploymentStatusBadge } from "@/components/deployment-status-badge"
import { db } from "@/prisma/db"
import { notFound } from "next/navigation"

export default async function DeploymentPage({
  params,
}: {
  params: Promise<{ slug: string; deploymentSlug: string }>
}) {
  const { slug, deploymentSlug } = await params
  const project = await db.orm.public.Project.where({
    slug: slug,
  }).first()
  if (!project) notFound()
  const deployment = await db.orm.public.Deployment.where({
    projectId: project.id,
    slug: deploymentSlug,
  }).first()

  if (!deployment) notFound()

  const isLive =
    deployment.status === "QUEUED" || deployment.status === "BUILDING"

  const deploymentUrl = `https://${project.slug}.yourdomain.com`

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-mono text-xl font-medium">{deployment.slug}</h1>
          <p className="text-sm text-muted-foreground">
            {deployment.branch ?? "unknown branch"} &middot;{" "}
            {deployment.commitSha ?? "no commit"}
          </p>
        </div>
        <DeploymentStatusBadge status={deployment.status} />
      </div>

      {deployment.status === "READY" && (
        <a
          href={deploymentUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-block text-sm text-blue-600 underline underline-offset-4 dark:text-blue-400"
        >
          {deploymentUrl}
        </a>
      )}

      <div>
        <h2 className="mb-3 text-sm font-medium text-muted-foreground">
          Build logs
        </h2>
        <BuildLogViewer deploymentId={deployment.id} isLive={isLive} />
      </div>
    </div>
  )
}
