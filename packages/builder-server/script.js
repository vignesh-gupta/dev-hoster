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

async function init() {
  console.log("Executing script")
  publishLog("Build Started...")
  publishLog(`Deployment: ${DEPLOYMENT_ID || "unknown"}`)
  await updateDeploymentStatus("BUILDING")

  const outDirPath = path.resolve(__dirname, "output")

  await cloneRepo(REPO_URL, GIT_PAT_TOKEN, outDirPath)
  await runBuild(outDirPath)

  publishLog("Build completed")

  const distFolderPath = path.join(outDirPath, "dist")

  if (!fs.existsSync(distFolderPath)) {
    publishLog(`Error: dist folder not found at ${distFolderPath}`)
    const contents = fs.readdirSync(outDirPath)
    publishLog(`output/ contains: ${contents.join(", ")}`)
    throw new Error("dist folder not found")
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
