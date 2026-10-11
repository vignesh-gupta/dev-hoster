import { promises as dns } from "node:dns"
import { db } from "@/prisma/db"
import type { Domain } from "@/lib/types"
import { toDomain } from "@/lib/server/db/mappers"
import { projectHost } from "@/lib/server/config"
import { HttpError, conflict } from "@/lib/server/http"

export async function listDomains(projectId: string): Promise<Domain[]> {
  const rows = await db.orm.public.Domain.where({ projectId })
    .orderBy((d) => d.createdAt.asc())
    .all()
  return rows.map(toDomain)
}

export async function createDomain(
  projectId: string,
  hostname: string
): Promise<Domain> {
  const clash = await db.orm.public.Domain.where({ hostname }).first()
  if (clash) throw conflict(`${hostname} is already in use`)
  return toDomain(await db.orm.public.Domain.create({ projectId, hostname }))
}

const normalize = (host: string) => host.toLowerCase().replace(/\.$/, "")

/**
 * Verifies the domain with a real DNS lookup: it must CNAME to the project's
 * default host. Marks it VERIFIED on success.
 */
export async function verifyDomain(
  projectId: string,
  id: string
): Promise<Domain | null> {
  const row = await db.orm.public.Domain.where({ id, projectId }).first()
  if (!row) return null
  const project = await db.orm.public.Project.where({ id: projectId }).first()
  if (!project) return null

  // CNAME targets carry no port, whatever PREVIEW_DOMAIN says.
  const target = normalize(projectHost(project.slug).split(":")[0]!)
  let records: string[] = []
  try {
    records = await dns.resolveCname(row.hostname)
  } catch {
    // no record yet; handled below
  }
  if (!records.some((r) => normalize(r) === target)) {
    throw new HttpError(
      422,
      `No CNAME found. Point ${row.hostname} at ${target}, wait for DNS to update, then verify again.`,
      "dns_not_verified"
    )
  }

  await db.orm.public.Domain.where({ id }).update({ status: "VERIFIED" })
  const updated = await db.orm.public.Domain.where({ id }).first()
  return updated ? toDomain(updated) : null
}

export async function deleteDomain(
  projectId: string,
  id: string
): Promise<boolean> {
  const row = await db.orm.public.Domain.where({ id, projectId }).first()
  if (!row) return false
  await db.orm.public.Domain.where({ id }).delete()
  return true
}
