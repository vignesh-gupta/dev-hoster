import { db } from "@/prisma/db"
import type { User } from "@/lib/types"
import { toUser } from "@/lib/server/db/mappers"

export async function getUser(id: number): Promise<User | null> {
  const row = await db.orm.public.User.where({ id }).first()
  return row ? toUser(row) : null
}
