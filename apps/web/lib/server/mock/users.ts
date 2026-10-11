// TODO-remove-last: mock user lookup.
import type { User } from "@/lib/types"
import { readCollection } from "./store"

export async function getUser(id: number): Promise<User | null> {
  const users = await readCollection<User[]>("users")
  return users.find((u) => u.id === id) ?? null
}
