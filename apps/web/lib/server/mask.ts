import type { EnvVar } from "@/lib/types"

export const SECRET_MASK = "••••••••"

/** Secret values are write-only over the API: they are never returned. */
export const maskEnvVar = (env: EnvVar): EnvVar =>
  env.secret ? { ...env, value: SECRET_MASK } : env
