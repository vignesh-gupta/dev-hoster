import { DeploymentStatusBadge } from "@/components/deployment-status-badge"
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@dev-hoster/ui/components/card"
import Link from "next/link"
import { CreateProjectForm } from "./create-project-form"

type ProjectWithActive = {
  id: string
  name: string
  slug: string
  repoUrl: string
  activeDeployment: { status: string } | null
}

export function ProjectList({ projects }: { projects: ProjectWithActive[] }) {
  if (projects.length === 0) {
    return (
      <div className="mx-auto max-w-md space-y-3 text-center">
        <p className="text-sm text-muted-foreground">
          No projects yet. Paste a GitHub repo to start building.
        </p>
        <CreateProjectForm />
      </div>
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <CreateProjectForm />

      {projects.map((project) => (
        <Link key={project.id} href={`/projects/${project.slug}`}>
          <Card className="transition-colors hover:border-foreground/20">
            <CardHeader className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <CardTitle className="truncate text-base">
                  {project.name}
                </CardTitle>
                {project.activeDeployment && (
                  <DeploymentStatusBadge
                    status={project.activeDeployment.status}
                  />
                )}
              </div>
              <CardDescription className="truncate">
                {project.repoUrl}
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>
      ))}
    </div>
  )
}
