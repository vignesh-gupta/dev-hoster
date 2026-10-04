import { NextRequest, NextResponse } from "next/server"
import { db } from "@/prisma/db"
import { Temporal } from "temporal-polyfill"

export const dynamic = "force-dynamic"

const DEPLOYMENT_STATUSES = ["BUILDING", "READY", "FAILED"] as const

type DeploymentStatus = (typeof DEPLOYMENT_STATUSES)[number]

function isDeploymentStatus(status: unknown): status is DeploymentStatus {
  return (
    typeof status === "string" &&
    DEPLOYMENT_STATUSES.includes(status as DeploymentStatus)
  )
}

export async function PATCH(
  req: NextRequest,
  ctx: RouteContext<"/api/deployments/[deploymentId]/status">
): Promise<NextResponse> {
  const token = req.headers.get("x-builder-token")
  if (!process.env.BUILDER_CALLBACK_TOKEN || token !== process.env.BUILDER_CALLBACK_TOKEN) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  }

  const { deploymentId } = await ctx.params
  const { status, s3Path } = await req.json()

  if (!isDeploymentStatus(status)) {
    return NextResponse.json({ error: "invalid status" }, { status: 400 })
  }

  const deployment = await db.orm.public.Deployment.where({
    id: deploymentId,
  }).first()

  if (!deployment) {
    return NextResponse.json({ error: "deployment not found" }, { status: 404 })
  }

  const now = Temporal.Now.instant()
  const update = {
    status,
    ...(status === "BUILDING" ? { startedAt: now } : {}),
    ...(status === "READY" || status === "FAILED" ? { finishedAt: now } : {}),
    ...(status === "READY" && typeof s3Path === "string" ? { s3Path } : {}),
  }

  await db.transaction(async (tx) => {
    await tx.orm.public.Deployment.where({ id: deployment.id }).update(update)

    if (status === "READY") {
      await tx.orm.public.Project.where({ id: deployment.projectId }).update({
        activeDeploymentId: deployment.id,
      })
    }
  })

  return NextResponse.json({ ok: true })
}
