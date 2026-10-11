import type { ApiErrorBody } from "@/lib/types"

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public code = "error",
    public issues: { path: string; message: string }[] = []
  ) {
    super(message)
  }
}

type Json = Record<string, unknown> | unknown[]

/**
 * Thin typed fetch wrapper over the REST API. Everything the UI does goes
 * through these routes, so the same endpoints can back a CLI later.
 */
export async function api<T>(
  path: string,
  init: { method?: string; body?: Json } = {}
): Promise<T> {
  const res = await fetch(`/api${path}`, {
    method: init.method ?? "GET",
    headers: init.body ? { "Content-Type": "application/json" } : undefined,
    body: init.body ? JSON.stringify(init.body) : undefined,
    cache: "no-store",
  })

  if (res.status === 204) return undefined as T
  const data = await res.json().catch(() => null)
  if (!res.ok) {
    const err = (data as ApiErrorBody | null)?.error
    throw new ApiError(
      res.status,
      err?.message ?? `Request failed (${res.status})`,
      err?.code,
      err?.issues
    )
  }
  return data as T
}
