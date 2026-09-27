const { exec } = require("child_process")
const path = require("path")
const fs = require("fs")
const { publishLog } = require("./config")

function detectPackageManager(outDirPath) {
  if (fs.existsSync(path.join(outDirPath, "pnpm-lock.yaml"))) return "pnpm"
  if (fs.existsSync(path.join(outDirPath, "yarn.lock"))) return "yarn"
  if (fs.existsSync(path.join(outDirPath, "package-lock.json"))) return "npm"
  return "npm"
}

function runBuild(outDirPath) {
  return new Promise((resolve, reject) => {
    const pm = detectPackageManager(outDirPath)
    publishLog(`Detected package manager: ${pm}`)

    const installCmd = pm === "yarn" ? "yarn install" : `${pm} install`
    const buildCmd = pm === "yarn" ? "yarn build" : `${pm} run build`

    const p = exec(`cd ${outDirPath} && ${installCmd} && ${buildCmd}`)

    p.stdout.on("data", (data) => publishLog(data.toString()))
    p.stderr.on("data", (data) => publishLog("Error: " + data.toString()))
    p.on("error", (err) => reject(err))
    p.on("close", (code) => {
      if (code !== 0) return reject(new Error(`Build failed with exit code ${code}`))
      resolve()
    })
  })
}

module.exports = { runBuild, detectPackageManager }