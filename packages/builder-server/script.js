const path = require("path")
const fs = require("fs")
const { publishLog } = require("./lib/config")
const { closePublisher } = require("./lib/config")
const { cloneRepo } = require("./lib/git")
const { runBuild } = require("./lib/buildRunner")
const { uploadDist } = require("./lib/uploader")
const { updateDeploymentStatus } = require("./lib/deploymentStatus")

const PROJECT_ID = process.env.PROJECT_ID
const DEPLOYMENT_ID = process.env.DEPLOYMENT_ID
const REPO_URL = process.env.GIT_REPOSITORY__URL
const GIT_PAT_TOKEN = process.env.GIT_PAT_TOKEN
const GIT_BRANCH = process.env.GIT_BRANCH
const GIT_COMMIT_SHA = process.env.GIT_COMMIT_SHA
const OUTPUT_DIR = process.env.OUTPUT_DIR || "dist"

async function init() {
  console.log("Executing script")
  publishLog("Build Started...")
  publishLog(`Deployment: ${DEPLOYMENT_ID || "unknown"}`)
  await updateDeploymentStatus("BUILDING")

  const outDirPath = path.resolve(__dirname, "output")

  const commit = await cloneRepo(REPO_URL, GIT_PAT_TOKEN, outDirPath, {
    branch: GIT_BRANCH,
    commitSha: GIT_COMMIT_SHA,
  })
  // Tell the web app which commit this deployment is building.
  await updateDeploymentStatus("BUILDING", {
    commitSha: commit.sha,
    commitMessage: commit.message,
  })

  await runBuild(outDirPath, {
    installCommand: process.env.INSTALL_COMMAND,
    buildCommand: process.env.BUILD_COMMAND,
    envJson: process.env.BUILD_ENV_JSON,
  })

  publishLog("Build completed")

  const distFolderPath = path.resolve(outDirPath, OUTPUT_DIR)
  if (!distFolderPath.startsWith(outDirPath + path.sep)) {
    throw new Error(`Output directory "${OUTPUT_DIR}" must be inside the repository`)
  }

  if (!fs.existsSync(distFolderPath)) {
    publishLog(`Error: output directory "${OUTPUT_DIR}" not found`)
    const contents = fs.readdirSync(outDirPath)
    publishLog(`Repository root contains: ${contents.join(", ")}`)
    throw new Error(`Output directory "${OUTPUT_DIR}" not found`)
  }

  const s3Path = await uploadDist(distFolderPath, PROJECT_ID)
  await updateDeploymentStatus("READY", { s3Path })
}

init()
  .catch(async (err) => {
    publishLog(err.message || err)
    try {
      await updateDeploymentStatus("FAILED")
    } catch (callbackErr) {
      publishLog(callbackErr.message || callbackErr)
    }
    process.exitCode = 1
  })
  .finally(async () => {
    await closePublisher()
  })
