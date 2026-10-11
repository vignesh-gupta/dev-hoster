"use client"

import { useMemo, useState } from "react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@dev-hoster/ui/components/select"
import { Rocket } from "lucide-react"
import { useDeployments } from "@/lib/api/hooks"
import { DEPLOYMENT_STATUSES, type DeploymentStatus } from "@/lib/types"
import { DeploymentsTable } from "@/components/deployments/deployments-table"
import { EmptyState } from "@/components/empty-state"
import { ErrorState } from "@/components/error-state"
import { Section } from "@/components/section"

const ALL = "all"
const LABEL: Record<DeploymentStatus, string> = {
  QUEUED: "Queued",
  BUILDING: "Building",
  READY: "Ready",
  FAILED: "Failed",
}

/** Deployment history with status + branch filters. `slug` scopes it to a project. */
export function DeploymentsView({ slug }: { slug?: string }) {
  const [status, setStatus] = useState<string>(ALL)
  const [branch, setBranch] = useState<string>(ALL)

  // Unfiltered query feeds the branch list; the filtered one feeds the table.
  const all = useDeployments({ projectSlug: slug })
  const filtered = useDeployments({
    projectSlug: slug,
    status: status === ALL ? undefined : (status as DeploymentStatus),
    branch: branch === ALL ? undefined : branch,
  })

  const branches = useMemo(
    () => [...new Set(all.data?.map((d) => d.branch).filter(Boolean) as string[])],
    [all.data]
  )

  if (all.isError)
    return <ErrorState error={all.error} onRetry={() => all.refetch()} />

  const isFiltered = status !== ALL || branch !== ALL

  return (
    <Section
      title={slug ? "Deployments" : "All deployments"}
      description={
        all.data ? `${all.data.length} total` : undefined
      }
      actions={
        <div className="flex items-center gap-2">
          <Select value={status} onValueChange={(v) => setStatus(v ?? ALL)}>
            <SelectTrigger size="sm" aria-label="Filter by status" className="w-32">
              <SelectValue>
                {(v: string) => (v === ALL ? "All statuses" : LABEL[v as DeploymentStatus])}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>All statuses</SelectItem>
              {DEPLOYMENT_STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  {LABEL[s]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={branch} onValueChange={(v) => setBranch(v ?? ALL)}>
            <SelectTrigger size="sm" aria-label="Filter by branch" className="w-32 font-mono">
              <SelectValue>
                {(v: string) => (v === ALL ? "All branches" : v)}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>All branches</SelectItem>
              {branches.map((b) => (
                <SelectItem key={b} value={b} className="font-mono">
                  {b}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      }
    >
      {filtered.data?.length === 0 ? (
        <EmptyState
          className="m-3"
          icon={Rocket}
          title={isFiltered ? "No deployments match" : "No deployments yet"}
          description={
            isFiltered
              ? "Try a different status or branch."
              : "Deployments appear here as soon as you deploy a project."
          }
        />
      ) : (
        <DeploymentsTable
          deployments={filtered.data}
          loading={filtered.isPending}
          showProject={!slug}
        />
      )}
    </Section>
  )
}
