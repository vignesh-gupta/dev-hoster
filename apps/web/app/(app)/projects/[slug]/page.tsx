import { ProjectOverview } from "@/components/projects/project-overview"

export default async function ProjectPage({
  params,
}: PageProps<"/projects/[slug]">) {
  const { slug } = await params
  return <ProjectOverview slug={slug} />
}
