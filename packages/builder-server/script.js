const path = require("path")
const fs = require("fs")
const { publishLog } = require("./lib/config")
const { cloneRepo } = require("./lib/git")
const { runBuild } = require("./lib/buildRunner")
const { uploadDist } = require("./lib/uploader")

const PROJECT_ID = process.env.PROJECT_ID
const REPO_URL = process.env.GIT_REPOSITORY__URL
const GIT_PAT_TOKEN = process.env.GIT_PAT_TOKEN

async function init() {
  console.log("Executing script")
  publishLog("Build Started...")

  const outDirPath = path.resolve(__dirname, "output")

  try {
    await cloneRepo(REPO_URL, GIT_PAT_TOKEN, outDirPath)
  } catch (err) {
    publishLog(`Clone failed: ${err.message}`)
    process.exit(1)
  }

  try {
    await runBuild(outDirPath)
  } catch (err) {
    publishLog(err.message)
    process.exit(1)
  }

  publishLog("Build completed")

  const distFolderPath = path.join(outDirPath, "dist")

  if (!fs.existsSync(distFolderPath)) {
    publishLog(`Error: dist folder not found at ${distFolderPath}`)
    const contents = fs.readdirSync(outDirPath)
    publishLog(`output/ contains: ${contents.join(", ")}`)
    process.exit(1)
  }

  await uploadDist(distFolderPath, PROJECT_ID)
}

init()