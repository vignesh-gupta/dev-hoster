// TODO-remove-last: mock custom-domain repository (temp/domains.json).
import { randomUUID } from "node:crypto"
import type { Domain } from "@/lib/types"
import { conflict } from "@/lib/server/http"
import { mutate, now, readCollection } from "./store"

export async function listDomains(projectId: string): Promise<Domain[]> {
  const all = await readCollection<Domain[]>("domains")
  return all
    .filter((d) => d.projectId === projectId)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
}

export async function createDomain(
  projectId: string,
  hostname: string
): Promise<Domain> {
  return mutate<Domain[], Domain>("domains", (all) => {
    if (all.some((d) => d.hostname === hostname))
      throw conflict(`${hostname} is already in use`)
    const domain: Domain = {
      id: randomUUID(),
      projectId,
      hostname,
      status: "PENDING",
      createdAt: now(),
    }
    all.push(domain)
    return domain
  })
}

/** Mock DNS check: always succeeds. */
export async function verifyDomain(
  projectId: string,
  id: string
): Promise<Domain | null> {
  return mutate<Domain[], Domain | null>("domains", (all) => {
    const d = all.find((x) => x.id === id && x.projectId === projectId)
    if (!d) return null
    d.status = "VERIFIED"
    return d
  })
}

export async function deleteDomain(
  projectId: string,
  id: string
): Promise<boolean> {
  return mutate<Domain[], boolean>("domains", (all) => {
    const i = all.findIndex((d) => d.id === id && d.projectId === projectId)
    if (i === -1) return false
    all.splice(i, 1)
    return true
  })
}
