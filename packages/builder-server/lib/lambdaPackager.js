const fs = require("fs")
const path = require("path")
const archiver = require("archiver")
const { publishLog } = require("./config")

function packageLambda(serverDir, deploymentId) {
  const zipFilePath = path.join("/tmp", `lambda-${deploymentId || "deployment"}.zip`)
  return new Promise((resolve, reject) => {
    const output = fs.createWriteStream(zipFilePath)
    const archive = archiver("zip", { zlib: { level: 9 } })

    output.on("close", () => {
      publishLog(`Created Lambda package (${archive.pointer()} bytes)`)
      resolve(zipFilePath)
    })
    output.on("error", reject)
    archive.on("error", reject)
    archive.pipe(output)
    archive.directory(serverDir, false)
    archive.finalize().catch(reject)
  })
}

module.exports = { packageLambda }
