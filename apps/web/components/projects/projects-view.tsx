"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useMemo, useState } from "react"
import { Button } from "@dev-hoster/ui/components/button"
import { Input } from "@dev-hoster/ui/components/input"
import { Skeleton } from "@dev-hoster/ui/components/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@dev-hoster/ui/components/table"
import { cn } from "@dev-hoster/ui/lib/utils"
import { FolderGit2, GitBranch, LayoutGrid, Plus, Rows3, Search } from "lucide-react"
import { useProjects } from "@/lib/api/hooks"
import { repoPath } from "@/lib/format"
import { useUiStore } from "@/lib/stores/ui-store"
import type { ProjectWithActive } from "@/lib/types"
import { EmptyState } from "@/components/empty-state"
import { ErrorState } from "@/components/error-state"
import { LinkButton } from "@/components/link-button"
import { PageHeader } from "@/components/page-header"
import { ProjectAvatar } from "@/components/project-avatar"
import { FRAMEWORK_LABEL } from "@/components/projects/project-shell"
import { StatusBadge } from "@/components/status-badge"
import { TimeAgo } from "@/components/time-ago"

export function ProjectsView() {
  const { data, isPending, isError, error, refetch } = useProjects()
  const { projectsView, setProjectsView } = useUiStore()
  const [query, setQuery] = useState("")

  const projects = useMemo(() => {
    const q = query.trim().toLowerCase()
    return (data ?? []).filter(
      (p) =>
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.slug.includes(q) ||
        p.repoUrl.toLowerCase().includes(q)
    )
  }, [data, query])

  return (
    <>
      <PageHeader
        title="Projects"
        description="Each project is a Git repo that builds into a live site."
        actions={
          <LinkButton href="/projects/new">
            <Plus /> New project
          </LinkButton>
        }
      />

      {isError ? (
        <ErrorState error={error} onRetry={() => refetch()} />
      ) : data?.length === 0 ? (
        <EmptyState
          icon={FolderGit2}
          title="Deploy your first project"
          description="Paste a GitHub repo URL. We clone it, build it, and give you a live URL in about a minute."
        >
          <LinkButton href="/projects/new">
            <Plus /> New project
          </LinkButton>
        </EmptyState>
      ) : (
        <>
          <div className="flex items-center gap-2">
            <div className="relative max-w-xs flex-1">
              <Search
                aria-hidden
                className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search projects"
                aria-label="Search projects"
                className="pl-8"
              />
            </div>
            <div className="ml-auto flex border" role="group" aria-label="View">
              {(
                [
                  ["table", Rows3, "Table view"],
                  ["grid", LayoutGrid, "Grid view"],
                ] as const
              ).map(([value, Icon, label]) => (
                <Button
                  key={value}
                  variant="ghost"
                  size="icon-sm"
                  aria-label={label}
                  aria-pressed={projectsView === value}
                  className={cn(projectsView === value && "bg-muted")}
                  onClick={() => setProjectsView(value)}
                >
                  <Icon />
                </Button>
              ))}
            </div>
          </div>

          {isPending ? (
            <div className="space-y-px border">
              {Array.from({ length: 4 }, (_, i) => (
                <Skeleton key={i} className="h-12 rounded-none" />
              ))}
            </div>
          ) : projects.length === 0 ? (
            <EmptyState
              icon={Search}
              title="No projects match"
              description={`Nothing matches "${query}".`}
            />
          ) : projectsView === "grid" ? (
            <ProjectGrid projects={projects} />
          ) : (
            <ProjectTable projects={projects} />
          )}
        </>
      )}
    </>
  )
}

function ProjectTable({ projects }: { projects: ProjectWithActive[] }) {
  const router = useRouter()
  return (
    <div className="border bg-card">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="pl-3">Project</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="hidden md:table-cell">Branch</TableHead>
            <TableHead className="hidden lg:table-cell">Framework</TableHead>
            <TableHead className="pr-3 text-right">Updated</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {projects.map((p) => (
            <TableRow
              key={p.id}
              className="cursor-pointer"
              onClick={(e) => {
                if ((e.target as HTMLElement).closest("a,button")) return
                router.push(`/projects/${p.slug}`)
              }}
            >
              <TableCell className="pl-3">
                <div className="flex items-center gap-2.5">
                  <ProjectAvatar name={p.name} />
                  <div className="min-w-0 leading-tight">
                    <Link
                      href={`/projects/${p.slug}`}
                      className="font-medium underline-offset-2 hover:underline focus-visible:underline"
                    >
                      {p.name}
                    </Link>
                    <p className="truncate font-mono text-[11px] text-muted-foreground">
                      {repoPath(p.repoUrl)}
                    </p>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                {p.latestDeployment ? (
                  <StatusBadge status={p.latestDeployment.status} />
                ) : (
                  <span className="text-muted-foreground">Not deployed</span>
                )}
              </TableCell>
              <TableCell className="hidden md:table-cell">
                <span className="inline-flex items-center gap-1 font-mono text-muted-foreground">
                  <GitBranch aria-hidden className="size-3" />
                  {p.branch}
                </span>
              </TableCell>
              <TableCell className="hidden text-muted-foreground lg:table-cell">
                {FRAMEWORK_LABEL[p.framework]}
              </TableCell>
              <TableCell className="pr-3 text-right text-muted-foreground">
                <TimeAgo iso={p.latestDeployment?.createdAt ?? p.updatedAt} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

function ProjectGrid({ projects }: { projects: ProjectWithActive[] }) {
  return (
    <ul className="grid gap-3 [grid-template-columns:repeat(auto-fill,minmax(17rem,1fr))]">
      {projects.map((p) => (
        <li key={p.id}>
          <Link
            href={`/projects/${p.slug}`}
            className="flex h-full flex-col gap-3 border bg-card p-3 transition-colors outline-none hover:border-primary/50 focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/50"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex min-w-0 items-center gap-2.5">
                <ProjectAvatar name={p.name} />
                <span className="truncate text-sm font-medium">{p.name}</span>
              </div>
              {p.latestDeployment && (
                <StatusBadge status={p.latestDeployment.status} />
              )}
            </div>
            <p className="truncate font-mono text-[11px] text-muted-foreground">
              {repoPath(p.repoUrl)}
            </p>
            <div className="mt-auto flex items-center justify-between text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1 font-mono">
                <GitBranch aria-hidden className="size-3" />
                {p.branch}
              </span>
              <TimeAgo iso={p.latestDeployment?.createdAt ?? p.updatedAt} />
            </div>
          </Link>
        </li>
      ))}
    </ul>
  )
}
