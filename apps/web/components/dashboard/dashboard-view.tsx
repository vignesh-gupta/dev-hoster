"use client"

import Link from "next/link"
import { useMemo } from "react"
import { Skeleton } from "@dev-hoster/ui/components/skeleton"
import { ArrowRight, FolderGit2, Plus } from "lucide-react"
import { useDeployments, useProjects } from "@/lib/api/hooks"
import { isTerminalStatus } from "@/lib/types"
import { DeploymentsTable } from "@/components/deployments/deployments-table"
import { EmptyState } from "@/components/empty-state"
import { ErrorState } from "@/components/error-state"
import { LinkButton } from "@/components/link-button"
import { PageHeader } from "@/components/page-header"
import { ProjectAvatar } from "@/components/project-avatar"
import { Section } from "@/components/section"
import { StatusBadge } from "@/components/status-badge"

const WEEK = 7 * 24 * 60 * 60 * 1000

export function DashboardView() {
  const projects = useProjects()
  const deployments = useDeployments({ limit: 8 })
  const all = useDeployments({})

  const stats = useMemo(() => {
    const p = projects.data
    const d = all.data
    if (!p || !d) return null
    const since = Date.now() - WEEK
    return [
      { label: "Projects", value: p.length },
      { label: "Live", value: p.filter((x) => x.activeDeployment).length },
      {
        label: "Building now",
        value: d.filter((x) => !isTerminalStatus(x.status)).length,
        accent: true,
      },
      {
        label: "Failed this week",
        value: d.filter(
          (x) => x.status === "FAILED" && new Date(x.createdAt).getTime() > since
        ).length,
      },
    ]
  }, [projects.data, all.data])

  if (projects.isError)
    return <ErrorState error={projects.error} onRetry={() => projects.refetch()} />

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="What is live, what is building, and what broke."
        actions={
          <LinkButton href="/projects/new">
            <Plus /> New project
          </LinkButton>
        }
      />

      {projects.data?.length === 0 ? (
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
          <dl className="grid grid-cols-2 gap-px border bg-border md:grid-cols-4 [&>div]:bg-card">
            {stats
              ? stats.map((s) => (
                  <div key={s.label} className="px-3 py-2.5">
                    <dt className="text-[11px] text-muted-foreground">{s.label}</dt>
                    <dd
                      className={
                        "text-xl font-semibold tabular-nums " +
                        (s.accent && s.value > 0 ? "text-accent-foreground dark:text-primary" : "")
                      }
                    >
                      {s.value}
                    </dd>
                  </div>
                ))
              : Array.from({ length: 4 }, (_, i) => (
                  <div key={i} className="px-3 py-2.5">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="mt-2 h-6 w-8" />
                  </div>
                ))}
          </dl>

          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_18rem]">
            <Section
              title="Recent deployments"
              actions={
                <LinkButton variant="ghost" size="xs" href="/deployments">
                  View all <ArrowRight />
                </LinkButton>
              }
            >
              <DeploymentsTable
                showProject
                deployments={deployments.data}
                loading={deployments.isPending}
              />
            </Section>

            <Section
              title="Projects"
              actions={
                <LinkButton variant="ghost" size="xs" href="/projects">
                  All <ArrowRight />
                </LinkButton>
              }
            >
              <ul className="divide-y">
                {projects.isPending &&
                  Array.from({ length: 4 }, (_, i) => (
                    <li key={i} className="p-3">
                      <Skeleton className="h-8" />
                    </li>
                  ))}
                {projects.data?.slice(0, 7).map((p) => (
                  <li key={p.id}>
                    <Link
                      href={`/projects/${p.slug}`}
                      className="flex items-center gap-2.5 px-3 py-2 transition-colors outline-none hover:bg-muted/60 focus-visible:bg-muted"
                    >
                      <ProjectAvatar name={p.name} className="size-6" />
                      <span className="min-w-0 flex-1 truncate text-xs font-medium">
                        {p.name}
                      </span>
                      {p.latestDeployment && (
                        <StatusBadge status={p.latestDeployment.status} />
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </Section>
          </div>
        </>
      )}
    </>
  )
}
