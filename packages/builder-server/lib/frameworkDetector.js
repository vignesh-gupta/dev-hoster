const fs = require("fs")
const path = require("path")

function findNextConfig(repoDir) {
  for (const filename of ["next.config.js", "next.config.mjs", "next.config.ts"]) {
    const configPath = path.join(repoDir, filename)
    if (fs.existsSync(configPath)) return configPath
  }
  return null
}

/**
 * Detects whether the build should be served statically or by Lambda.
 * Config parsing is intentionally limited to the output property so user
 * config code is never executed inside the builder.
 */
function detectDeploymentType(repoDir, options = {}) {
  const configuredOutputDir = options.configuredOutputDir || "dist"
  if (options.framework !== "NEXT") {
    return { deploymentType: "STATIC", outputDir: configuredOutputDir }
  }

  const configPath = findNextConfig(repoDir)
  if (!configPath) return { deploymentType: "SSR", outputDir: configuredOutputDir }

  const source = fs.readFileSync(configPath, "utf8")
  const outputMatch = source.match(/\boutput\s*:\s*["']([^"']+)["']/)
  if (outputMatch && outputMatch[1] === "export") {
    return { deploymentType: "STATIC", outputDir: "out" }
  }

  return { deploymentType: "SSR", outputDir: configuredOutputDir }
}

module.exports = { detectDeploymentType }
