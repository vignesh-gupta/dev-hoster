// TODO-remove-last: mock environment-variable repository (temp/env-vars.json).
import { randomUUID } from "node:crypto"
import type { z } from "zod"
import type { envVarInputSchema, updateEnvVarSchema } from "@/lib/schemas"
import type { EnvVar } from "@/lib/types"
import { conflict } from "@/lib/server/http"
import { mutate, now, readCollection } from "./store"

type EnvInput = z.input<typeof envVarInputSchema>

export async function listEnvVars(projectId: string): Promise<EnvVar[]> {
  const all = await readCollection<EnvVar[]>("env-vars")
  return all
    .filter((e) => e.projectId === projectId)
    .sort((a, b) => a.key.localeCompare(b.key))
}

export async function createEnvVars(
  projectId: string,
  inputs: EnvInput[]
): Promise<EnvVar[]> {
  if (inputs.length === 0) return []
  return mutate<EnvVar[], EnvVar[]>("env-vars", (all) => {
    const ts = now()
    const created: EnvVar[] = []
    for (const input of inputs) {
      const clash =
        all.some((e) => e.projectId === projectId && e.key === input.key) ||
        created.some((e) => e.key === input.key)
      if (clash) throw conflict(`${input.key} already exists`)
      created.push({
        id: randomUUID(),
        projectId,
        key: input.key,
        value: input.value,
        secret: input.secret ?? false,
        createdAt: ts,
        updatedAt: ts,
      })
    }
    all.push(...created)
    return created
  })
}

export async function updateEnvVar(
  projectId: string,
  id: string,
  patch: z.infer<typeof updateEnvVarSchema>
): Promise<EnvVar | null> {
  return mutate<EnvVar[], EnvVar | null>("env-vars", (all) => {
    const env = all.find((e) => e.id === id && e.projectId === projectId)
    if (!env) return null
    if (
      patch.key &&
      all.some(
        (e) => e.projectId === projectId && e.id !== id && e.key === patch.key
      )
    )
      throw conflict(`${patch.key} already exists`)
    Object.assign(env, patch, { updatedAt: now() })
    return env
  })
}

export async function deleteEnvVar(
  projectId: string,
  id: string
): Promise<boolean> {
  return mutate<EnvVar[], boolean>("env-vars", (all) => {
    const i = all.findIndex((e) => e.id === id && e.projectId === projectId)
    if (i === -1) return false
    all.splice(i, 1)
    return true
  })
}
