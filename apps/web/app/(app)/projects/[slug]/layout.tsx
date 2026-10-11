import { ProjectShell } from "@/components/projects/project-shell"

export default async function ProjectLayout({
  children,
  params,
}: LayoutProps<"/projects/[slug]">) {
  const { slug } = await params
  return <ProjectShell slug={slug}>{children}</ProjectShell>
}
