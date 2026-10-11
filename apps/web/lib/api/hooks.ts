"use client"

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"
import type {
  CreateDeploymentInput,
  CreateProjectInput,
  UpdateProjectInput,
} from "@/lib/schemas"
import type {
  Deployment,
  DeploymentStatus,
  DeploymentWithProject,
  Domain,
  DomainsResponse,
  EnvVar,
  ProjectWithActive,
  User,
} from "@/lib/types"
import { isTerminalStatus } from "@/lib/types"
import { api } from "./client"

// ---- query keys ------------------------------------------------------------
export const keys = {
  me: ["me"] as const,
  projects: ["projects"] as const,
  project: (slug: string) => ["projects", slug] as const,
  env: (slug: string) => ["projects", slug, "env"] as const,
  domains: (slug: string) => ["projects", slug, "domains"] as const,
  deployments: ["deployments"] as const,
  deploymentList: (f: DeploymentFilters) => ["deployments", "list", f] as const,
  deployment: (slug: string, depSlug: string) =>
    ["deployments", "detail", slug, depSlug] as const,
}

const POLL_MS = 3000
const isActive = (s?: DeploymentStatus | null) => !!s && !isTerminalStatus(s)

export interface DeploymentFilters {
  projectSlug?: string
  status?: DeploymentStatus
  branch?: string
  limit?: number
}

// ---- queries ---------------------------------------------------------------
export function useMe() {
  return useQuery({ queryKey: keys.me, queryFn: () => api<User>("/me") })
}

export function useProjects() {
  return useQuery({
    queryKey: keys.projects,
    queryFn: () => api<ProjectWithActive[]>("/projects"),
    // Keep the list fresh while any project has a build in flight.
    refetchInterval: (q) =>
      q.state.data?.some((p) => isActive(p.latestDeployment?.status))
        ? POLL_MS
        : false,
  })
}

export function useProject(slug: string) {
  return useQuery({
    queryKey: keys.project(slug),
    queryFn: () => api<ProjectWithActive>(`/projects/${slug}`),
    retry: false,
    refetchInterval: (q) =>
      isActive(q.state.data?.latestDeployment?.status) ? POLL_MS : false,
  })
}

export function useDeployments(filters: DeploymentFilters = {}) {
  const { projectSlug, ...query } = filters
  return useQuery({
    queryKey: keys.deploymentList(filters),
    queryFn: () => {
      const qs = new URLSearchParams()
      for (const [k, v] of Object.entries(query))
        if (v !== undefined) qs.set(k, String(v))
      const base = projectSlug
        ? `/projects/${projectSlug}/deployments`
        : "/deployments"
      return api<DeploymentWithProject[]>(`${base}?${qs}`)
    },
    placeholderData: keepPreviousData,
    refetchInterval: (q) =>
      q.state.data?.some((d) => isActive(d.status)) ? POLL_MS : false,
  })
}

export type DeploymentDetail = {
  project: ProjectWithActive
  deployment: Deployment & { isActive: boolean }
}

export function useDeployment(slug: string, deploymentSlug: string) {
  return useQuery({
    queryKey: keys.deployment(slug, deploymentSlug),
    queryFn: () =>
      api<DeploymentDetail>(`/projects/${slug}/deployments/${deploymentSlug}`),
    retry: false,
    refetchInterval: (q) =>
      isActive(q.state.data?.deployment.status) ? POLL_MS : false,
  })
}

export function useEnvVars(slug: string) {
  return useQuery({
    queryKey: keys.env(slug),
    queryFn: () => api<EnvVar[]>(`/projects/${slug}/env`),
  })
}

export function useDomains(slug: string) {
  return useQuery({
    queryKey: keys.domains(slug),
    queryFn: () => api<DomainsResponse>(`/projects/${slug}/domains`),
  })
}

// ---- mutations -------------------------------------------------------------
/** Refreshes everything derived from projects/deployments after a write. */
function useInvalidate() {
  const qc = useQueryClient()
  return () =>
    Promise.all([
      qc.invalidateQueries({ queryKey: keys.projects }),
      qc.invalidateQueries({ queryKey: keys.deployments }),
    ])
}

export function useCreateProject() {
  const invalidate = useInvalidate()
  return useMutation({
    mutationFn: (input: CreateProjectInput) =>
      api<{ project: ProjectWithActive; deployment: Deployment }>("/projects", {
        method: "POST",
        body: input,
      }),
    onSuccess: invalidate,
  })
}

export function useUpdateProject(slug: string) {
  const invalidate = useInvalidate()
  return useMutation({
    mutationFn: (patch: UpdateProjectInput) =>
      api<ProjectWithActive>(`/projects/${slug}`, {
        method: "PATCH",
        body: patch,
      }),
    onSuccess: invalidate,
  })
}

export function useDeleteProject(slug: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => api<void>(`/projects/${slug}`, { method: "DELETE" }),
    onSuccess: () => {
      qc.removeQueries({ queryKey: keys.project(slug) })
      qc.invalidateQueries({ queryKey: keys.projects })
      qc.invalidateQueries({ queryKey: keys.deployments })
    },
  })
}

export function useTriggerDeployment(slug: string) {
  const invalidate = useInvalidate()
  return useMutation({
    mutationFn: (input: CreateDeploymentInput = {}) =>
      api<Deployment>(`/projects/${slug}/deployments`, {
        method: "POST",
        body: input,
      }),
    onSuccess: invalidate,
  })
}

export function usePromoteDeployment(slug: string, deploymentSlug: string) {
  const invalidate = useInvalidate()
  return useMutation({
    mutationFn: () =>
      api<{ ok: true }>(
        `/projects/${slug}/deployments/${deploymentSlug}/promote`,
        { method: "POST" }
      ),
    onSuccess: invalidate,
  })
}

export function useCancelDeployment(slug: string, deploymentSlug: string) {
  const invalidate = useInvalidate()
  return useMutation({
    mutationFn: () =>
      api<Deployment>(`/projects/${slug}/deployments/${deploymentSlug}/cancel`, {
        method: "POST",
      }),
    onSuccess: invalidate,
  })
}

export function useCreateEnvVar(slug: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: { key: string; value: string; secret: boolean }) =>
      api<EnvVar>(`/projects/${slug}/env`, { method: "POST", body: input }),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.env(slug) }),
  })
}

export function useUpdateEnvVar(slug: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      ...patch
    }: {
      id: string
      key?: string
      value?: string
      secret?: boolean
    }) => api<EnvVar>(`/projects/${slug}/env/${id}`, { method: "PATCH", body: patch }),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.env(slug) }),
  })
}

export function useDeleteEnvVar(slug: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      api<void>(`/projects/${slug}/env/${id}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.env(slug) }),
  })
}

export function useAddDomain(slug: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (hostname: string) =>
      api<Domain>(`/projects/${slug}/domains`, {
        method: "POST",
        body: { hostname },
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.domains(slug) }),
  })
}

export function useVerifyDomain(slug: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      api<Domain>(`/projects/${slug}/domains/${id}/verify`, { method: "POST" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.domains(slug) }),
  })
}

export function useDeleteDomain(slug: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      api<void>(`/projects/${slug}/domains/${id}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.domains(slug) }),
  })
}
