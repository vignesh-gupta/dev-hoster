import { ProjectList } from "@/components/project-list"
import { db } from "@/prisma/db"

export default async function ProjectsPage() {

  const projects = await db.orm.public.Project.include("activeDeployment")
    .orderBy((p) => p.createdAt.desc())
    .all()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-medium">Projects</h1>
        <p className="text-sm text-muted-foreground">
          Every deployed project in this workspace.
        </p>
      </div>
      <ProjectList projects={JSON.parse(JSON.stringify(projects))} />
    </div>
  )
}
