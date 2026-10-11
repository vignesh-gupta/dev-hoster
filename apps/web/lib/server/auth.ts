// No auth yet: every request acts as user 0 (the "system" user seeded in
// temp/seed/users.json and prisma/seed.ts).

export const SYSTEM_USER_ID = 0

export async function getCurrentUserId(): Promise<number> {
  // TODO-AUTH: resolve the signed-in user from the session instead.
  // import { getSession } from "@/lib/auth/session"
  // const session = await getSession()
  // if (!session) throw new HttpError(401, "Not signed in", "unauthorized")
  // return session.userId
  return SYSTEM_USER_ID
}
