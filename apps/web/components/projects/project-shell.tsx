"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Badge } from "@dev-hoster/ui/components/badge"
import { Skeleton } from "@dev-hoster/ui/components/skeleton"
import { cn } from "@dev-hoster/ui/lib/utils"
import { ArrowUpRight, GitBranch } from "lucide-react"
import { useProject } from "@/lib/api/hooks"
import { repoPath } from "@/lib/format"
import { DeployButton } from "@/components/deployments/deploy-button"
import { ErrorState } from "@/components/error-state"
import { LinkButton } from "@/components/link-button"
import { ProjectAvatar } from "@/components/project-avatar"

const TABS = [
  { label: "Overview", path: "" },
  { label: "Deployments", path: "/deployments" },
  { label: "Settings", path: "/settings" },
]

export const FRAMEWORK_LABEL = {
  REACT: "React",
  VUE: "Vue",
  SVELTE: "Svelte",
  STATIC: "Static",
} as const

export function ProjectShell({
  slug,
  children,
}: {
  slug: string
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const query = useProject(slug)
  const base = `/projects/${slug}`

  if (query.isError)
    return (
      <ErrorState
        error={query.error}
        onRetry={() => query.refetch()}
        notFoundTitle="Project not found"
        backHref="/projects"
        backLabel="All projects"
      />
    )

  const project = query.data
  const isTabActive = (path: string) =>
    path === ""
      ? pathname === base
      : pathname === base + path || pathname.startsWith(`${base}${path}/`)

  return (
    <div className="space-y-5">
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            {project ? (
              <ProjectAvatar name={project.name} className="size-9 text-sm" />
            ) : (
              <Skeleton className="size-9" />
            )}
            <div className="min-w-0 space-y-0.5">
              {project ? (
                <h1 className="flex items-center gap-2 text-lg font-semibold tracking-tight">
                  <span className="truncate">{project.name}</span>
                  <Badge variant="outline" className="font-normal">
                    {FRAMEWORK_LABEL[project.framework]}
                  </Badge>
                </h1>
              ) : (
                <Skeleton className="h-6 w-44" />
              )}
              {project ? (
                <a
                  href={project.repoUrl}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="inline-flex items-center gap-1 font-mono text-xs text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
                >
                  {repoPath(project.repoUrl)}
                  <span className="inline-flex items-center gap-0.5 before:mx-1 before:content-['·']">
                    <GitBranch aria-hidden className="size-3" />
                    {project.branch}
                  </span>
                </a>
              ) : (
                <Skeleton className="h-4 w-56" />
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {project?.activeDeployment && (
              <LinkButton href={project.url} external variant="outline">
                Visit <ArrowUpRight />
              </LinkButton>
            )}
            <DeployButton slug={slug} />
          </div>
        </div>

        <nav aria-label="Project" className="-mb-px flex gap-1 border-b">
          {TABS.map((t) => {
            const active = isTabActive(t.path)
            return (
              <Link
                key={t.label}
                href={base + t.path}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative -mb-px px-3 py-2 text-xs font-medium transition-colors outline-none focus-visible:bg-muted",
                  active
                    ? "text-foreground after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {t.label}
              </Link>
            )
          })}
        </nav>
      </div>
      {children}
    </div>
  )
}
