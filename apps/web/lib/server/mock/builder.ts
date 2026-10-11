// TODO-remove-last: simulated build lifecycle. Replaces the ECS task +
// packages/builder-server, which clone, build, upload to S3 and report back via
// PATCH /api/deployments/[id]/status while streaming logs through Redis.
//
// QUEUED -> BUILDING -> READY | FAILED on timers. A repo URL containing "fail"
// makes the build fail, which is handy for exercising the FAILED UI.
import type { LogLevel, Project } from "@/lib/types"
import { isTerminalStatus } from "@/lib/types"
import { getDeploymentById, updateDeploymentStatus } from "./deployments"
import { listEnvVars } from "./env-vars"
import { appendLog, clearLogs } from "./logs"
import { getProjectById } from "./projects"

interface RunnerState {
  cancelled: boolean
}

// Shared across route bundles / HMR reloads.
const g = globalThis as unknown as { __mockRunners?: Map<string, RunnerState> }
const runners = (g.__mockRunners ??= new Map())

const speed = () => Math.max(Number(process.env.MOCK_BUILD_SPEED ?? 1), 0.1)
const sleep = (ms: number) =>
  new Promise((r) => setTimeout(r, ms / speed()))
const jitter = (min: number, max: number) =>
  min + Math.random() * (max - min)

export function cancelRunner(deploymentId: string) {
  const state = runners.get(deploymentId)
  if (state) state.cancelled = true
}

/** Starts a build for the deployment unless one is already running in-process. */
export function ensureRunner(deploymentId: string) {
  if (runners.has(deploymentId)) return
  const state: RunnerState = { cancelled: false }
  runners.set(deploymentId, state)
  void run(deploymentId, state)
    .catch((err) => console.error("[mock-builder]", err))
    .finally(() => runners.delete(deploymentId))
}

function script(project: Project, sha: string, slug: string, envCount: number) {
  const pm = project.installCommand.split(" ")[0] || "npm"
  const fail = /fail/i.test(project.repoUrl)
  const lines: { msg: string; level?: LogLevel; wait: number }[] = [
    { msg: `Cloning ${project.repoUrl}#${project.branch}`, wait: 600 },
    { msg: `Cloned repository (commit ${sha.slice(0, 7)})`, wait: 900 },
    { msg: `Detected package manager: ${pm}`, wait: 300 },
    ...(envCount
      ? [{ msg: `Injecting ${envCount} environment variable(s)`, wait: 250 }]
      : []),
    { msg: `$ ${project.installCommand}`, wait: 500 },
    { msg: "Resolving dependencies...", wait: 900 },
    { msg: "added 312 packages in 8s", wait: 1100 },
    { msg: `$ ${project.buildCommand}`, wait: 500 },
    { msg: "> vite build", wait: 400 },
    { msg: "transforming...", wait: 900 },
  ]
  if (fail) {
    lines.push(
      { msg: "error during build:", level: "error", wait: 500 },
      {
        msg: "Could not resolve './widgets/Chart' from 'src/App.tsx'",
        level: "error",
        wait: 200,
      },
      { msg: "Build failed with exit code 1", level: "error", wait: 200 }
    )
  } else {
    lines.push(
      { msg: "✓ 134 modules transformed.", wait: 700 },
      { msg: `${project.outputDir}/index.html  0.46 kB`, wait: 150 },
      { msg: `${project.outputDir}/assets/index.css  4.12 kB`, wait: 150 },
      { msg: `${project.outputDir}/assets/index.js  143.2 kB`, wait: 150 },
      {
        msg: `Uploading ${project.outputDir}/ to s3://dev-hoster/${project.slug}/${slug}`,
        wait: 600,
      },
      { msg: "Uploaded 5 files", wait: 800 },
      { msg: "Deployment ready", wait: 200 }
    )
  }
  return { lines, fail }
}

async function run(id: string, state: RunnerState) {
  const deployment = await getDeploymentById(id)
  if (!deployment || isTerminalStatus(deployment.status)) return
  const project = await getProjectById(deployment.projectId)
  if (!project) return

  // A resumed build (e.g. after a server restart) starts over with a clean log.
  await clearLogs(id)
  await sleep(1500)
  if (state.cancelled) return

  await updateDeploymentStatus(id, "BUILDING")
  const envCount = (await listEnvVars(project.id)).length
  const { lines, fail } = script(
    project,
    deployment.commitSha ?? "0000000",
    deployment.slug,
    envCount
  )
  for (const line of lines) {
    await sleep(jitter(line.wait * 0.6, line.wait * 1.2))
    if (state.cancelled) return
    await appendLog(id, line.msg, line.level)
  }
  if (state.cancelled) return

  await updateDeploymentStatus(
    id,
    fail ? "FAILED" : "READY",
    fail ? undefined : `${project.slug}/${deployment.slug}`
  )
}
