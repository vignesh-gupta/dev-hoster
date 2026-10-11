const { execFile } = require("child_process")
const { URL } = require("url")
const { publishLog } = require("./config")

function buildAuthenticatedUrl(repoUrl, token) {
  if (!token) return repoUrl
  const u = new URL(repoUrl)
  u.username = token
  return u.toString()
}

function git(args, { cwd } = {}) {
  return new Promise((resolve, reject) => {
    execFile("git", args, { cwd, maxBuffer: 10 * 1024 * 1024 }, (err, stdout, stderr) => {
      if (stderr && stderr.trim()) publishLog(stderr)
      if (err) return reject(new Error(`git ${args[0]} failed: ${err.message}`))
      resolve(stdout.trim())
    })
  })
}

/**
 * Clones `branch` and, when `commitSha` is set, checks that exact commit out.
 * Resolves with the commit that was built so the web app can show it.
 */
async function cloneRepo(repoUrl, token, outDirPath, { branch, commitSha } = {}) {
  publishLog(`Cloning repository: ${repoUrl}${branch ? ` (${branch})` : ""}`)
  const authUrl = buildAuthenticatedUrl(repoUrl, token)

  // A pinned commit may sit behind the branch tip, so only shallow-clone tips.
  const args = ["clone", ...(branch ? ["--branch", branch] : [])]
  if (!commitSha) args.push("--depth", "1")
  await git([...args, authUrl, outDirPath])

  if (commitSha) {
    publishLog(`Checking out ${commitSha.slice(0, 7)}`)
    await git(["checkout", "--detach", commitSha], { cwd: outDirPath })
  }

  const sha = await git(["rev-parse", "HEAD"], { cwd: outDirPath })
  const message = await git(["log", "-1", "--format=%s"], { cwd: outDirPath })
  publishLog(`Building ${sha.slice(0, 7)}: ${message}`)
  return { sha, message }
}

module.exports = { cloneRepo, buildAuthenticatedUrl }
