"use client"

import Link from "next/link"
import { ArrowRight, ArrowUpRight, Globe, Rocket } from "lucide-react"
import { useDeployments, useProject } from "@/lib/api/hooks"
import { shortSha } from "@/lib/format"
import { DeploymentsTable } from "@/components/deployments/deployments-table"
import { CopyButton } from "@/components/copy-button"
import { EmptyState } from "@/components/empty-state"
import { LinkButton } from "@/components/link-button"
import { FRAMEWORK_LABEL } from "@/components/projects/project-shell"
import { Section } from "@/components/section"
import { StatusBadge } from "@/components/status-badge"
import { TimeAgo } from "@/components/time-ago"
import { Skeleton } from "@dev-hoster/ui/components/skeleton"

export function ProjectOverview({ slug }: { slug: string }) {
  const project = useProject(slug).data
  const deployments = useDeployments({ projectSlug: slug, limit: 5 })
  const active = project?.activeDeployment
  const latest = project?.latestDeployment

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_17rem]">
      <div className="min-w-0 space-y-5">
        <Section
          title="Production"
          description="What visitors see at your project URL"
        >
          {!project ? (
            <Skeleton className="m-3 h-20" />
          ) : active ? (
            <div className="space-y-3 p-3">
              <div className="flex flex-wrap items-center gap-1">
                <Globe aria-hidden className="size-3.5 text-muted-foreground" />
                <a
                  href={project.url}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="inline-flex items-center gap-1 font-mono text-sm font-medium underline-offset-2 hover:underline"
                >
                  {project.url.replace(/^https?:\/\//, "")}
                  <ArrowUpRight aria-hidden className="size-3.5" />
                </a>
                <CopyButton value={project.url} label="Copy URL" />
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
                <StatusBadge status={active.status} />
                <Link
                  href={`/projects/${slug}/deployments/${active.slug}`}
                  className="font-mono text-foreground underline-offset-2 hover:underline"
                >
                  {active.slug}
                </Link>
                <span className="font-mono">{shortSha(active.commitSha)}</span>
                <span className="truncate">{active.commitMessage}</span>
                <TimeAgo iso={active.finishedAt ?? active.createdAt} />
              </div>
            </div>
          ) : (
            <EmptyState
              className="m-3"
              icon={Rocket}
              title="Nothing is live yet"
              description={
                latest && latest.status !== "READY"
                  ? latest.status === "FAILED"
                    ? "The last build failed. Check its logs, fix the repo, and deploy again."
                    : "Your first build is in progress. It goes live as soon as it succeeds."
                  : "Deploy this project to get a live URL."
              }
            >
              {latest && (
                <LinkButton
                  variant="outline"
                  href={`/projects/${slug}/deployments/${latest.slug}`}
                >
                  View latest build <ArrowRight />
                </LinkButton>
              )}
            </EmptyState>
          )}
        </Section>

        <Section
          title="Recent deployments"
          actions={
            <LinkButton
              variant="ghost"
              size="xs"
              href={`/projects/${slug}/deployments`}
            >
              View all <ArrowRight />
            </LinkButton>
          }
        >
          {deployments.data?.length === 0 ? (
            <p className="p-3 text-xs text-muted-foreground">
              No deployments yet. Press Deploy to start the first one.
            </p>
          ) : (
            <DeploymentsTable
              deployments={deployments.data}
              loading={deployments.isPending}
            />
          )}
        </Section>
      </div>

      <aside className="space-y-5">
        <Section title="Project">
          {project ? (
            <dl className="divide-y text-xs">
              <Row label="Repository">
                <a
                  href={project.repoUrl}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="break-all underline-offset-2 hover:underline"
                >
                  {project.repoUrl.replace(/^https?:\/\//, "")}
                </a>
              </Row>
              <Row label="Branch" mono>
                {project.branch}
              </Row>
              <Row label="Framework">{FRAMEWORK_LABEL[project.framework]}</Row>
              <Row label="Install" mono>
                {project.installCommand || "—"}
              </Row>
              <Row label="Build" mono>
                {project.buildCommand || "—"}
              </Row>
              <Row label="Output" mono>
                {project.outputDir}/
              </Row>
            </dl>
          ) : (
            <Skeleton className="m-3 h-32" />
          )}
        </Section>
      </aside>
    </div>
  )
}

function Row({
  label,
  mono,
  children,
}: {
  label: string
  mono?: boolean
  children: React.ReactNode
}) {
  return (
    <div className="space-y-0.5 px-3 py-2">
      <dt className="text-[11px] text-muted-foreground">{label}</dt>
      <dd className={mono ? "font-mono" : undefined}>{children}</dd>
    </div>
  )
}
