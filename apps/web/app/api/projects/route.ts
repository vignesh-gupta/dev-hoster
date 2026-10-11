import type { NextRequest } from "next/server"
import { createProjectSchema } from "@/lib/schemas"
import { getCurrentUserId } from "@/lib/server/auth"
import { createProject, listProjects } from "@/lib/server/data"
import { handle, ok, parseBody } from "@/lib/server/http"

export const dynamic = "force-dynamic"

export async function GET() {
  return handle(async () => ok(await listProjects()))
}

/** Creates a project and queues its first deployment. */
export async function POST(req: NextRequest) {
  return handle(async () => {
    const input = await parseBody(req, createProjectSchema)
    const userId = await getCurrentUserId()
    return ok(await createProject(input, userId), 201)
  })
}
