const { exec } = require("child_process")
const { URL } = require("url")
const { publishLog } = require("./config")

function buildAuthenticatedUrl(repoUrl, token) {
  if (!token) return repoUrl
  const u = new URL(repoUrl)
  u.username = token
  return u.toString()
}

function cloneRepo(repoUrl, token, outDirPath) {
  return new Promise((resolve, reject) => {
    
    publishLog(`Cloning repository: ${repoUrl}`)
    const authUrl = buildAuthenticatedUrl(repoUrl, token)
    
    const p = exec(`git clone "${authUrl}" "${outDirPath}"`)

    p.stdout.on("data", (data) => publishLog(data.toString()))
    p.stderr.on("data", (data) => publishLog("Error: " + data.toString()))
    p.on("error", (err) => reject(err))
    p.on("close", (code) => {
      if (code !== 0) return reject(new Error(`git clone failed with exit code ${code}`))
      resolve()
    })
  })
}

module.exports = { cloneRepo, buildAuthenticatedUrl }