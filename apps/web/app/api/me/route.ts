import { getCurrentUserId } from "@/lib/server/auth"
import { getUser } from "@/lib/server/data"
import { handle, notFound, ok } from "@/lib/server/http"

export const dynamic = "force-dynamic"

export async function GET() {
  return handle(async () => {
    const user = await getUser(await getCurrentUserId())
    if (!user) throw notFound("User")
    return ok(user)
  })
}
