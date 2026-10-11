import { db } from "@/prisma/db"
import type { z } from "zod"
import type { envVarInputSchema, updateEnvVarSchema } from "@/lib/schemas"
import type { EnvVar } from "@/lib/types"
import {
  toEnvVar,
  type EnvVarRow,
} from "@/lib/server/db/mappers"
import { conflict } from "@/lib/server/http"

type EnvInput = z.input<typeof envVarInputSchema>

/** Raw rows (unmasked values): used to hand variables to the builder. */
export async function listEnvVarRows(projectId: string): Promise<EnvVarRow[]> {
  return await db.orm.public.EnvVar.where({ projectId })
    .orderBy((e) => e.key.asc())
    .all()
}

export async function listEnvVars(projectId: string): Promise<EnvVar[]> {
  return (await listEnvVarRows(projectId)).map(toEnvVar)
}

export async function createEnvVars(
  projectId: string,
  inputs: EnvInput[]
): Promise<EnvVar[]> {
  if (inputs.length === 0) return []
  const existing = new Set((await listEnvVarRows(projectId)).map((e) => e.key))
  for (const input of inputs) {
    if (existing.has(input.key)) throw conflict(`${input.key} already exists`)
    existing.add(input.key)
  }
  return await db.transaction(async (tx) => {
    const created: EnvVar[] = []
    for (const input of inputs) {
      const row = await tx.orm.public.EnvVar.create({
        projectId,
        key: input.key,
        value: input.value,
        secret: input.secret ?? false,
      })
      created.push(toEnvVar(row))
    }
    return created
  })
}

export async function updateEnvVar(
  projectId: string,
  id: string,
  patch: z.infer<typeof updateEnvVarSchema>
): Promise<EnvVar | null> {
  const row = await db.orm.public.EnvVar.where({ id, projectId }).first()
  if (!row) return null
  if (patch.key && patch.key !== row.key) {
    const clash = await db.orm.public.EnvVar.where({
      projectId,
      key: patch.key,
    }).first()
    if (clash) throw conflict(`${patch.key} already exists`)
  }
  if (Object.keys(patch).length > 0) {
    await db.orm.public.EnvVar.where({ id }).update(patch)
  }
  const updated = await db.orm.public.EnvVar.where({ id }).first()
  return updated ? toEnvVar(updated) : null
}

export async function deleteEnvVar(
  projectId: string,
  id: string
): Promise<boolean> {
  const row = await db.orm.public.EnvVar.where({ id, projectId }).first()
  if (!row) return false
  await db.orm.public.EnvVar.where({ id }).delete()
  return true
}
