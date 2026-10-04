const { publishLog, publishStatus } = require("./config")

const DEPLOYMENT_ID = process.env.DEPLOYMENT_ID
const WEB_BASE_URL = process.env.WEB_BASE_URL || "http://host.docker.internal:3000"
const CALLBACK_TOKEN = process.env.BUILDER_CALLBACK_TOKEN

async function updateDeploymentStatus(status, extra = {}) {
  publishStatus(status)

  if (!DEPLOYMENT_ID || !WEB_BASE_URL || !CALLBACK_TOKEN) {
    publishLog(
      "Skipping deployment status callback because DEPLOYMENT_ID, WEB_BASE_URL, or BUILDER_CALLBACK_TOKEN is missing"
    )
    return
  }

  const url = `${WEB_BASE_URL}/api/deployments/${DEPLOYMENT_ID}/status`;

  console.log(`Sending deployment status callback to ${url} with status: ${status}`)
  
  const response = await fetch(url, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "x-builder-token": CALLBACK_TOKEN,
      "Allow-Control-Allow-Origin": "*",
    },
    body: JSON.stringify({ status, ...extra }),
  }).catch((err) => {
    console.error(`Error sending deployment status callback: ${err.message || err}`)
  })

  if (!response.ok) {
    const body = await response.text()
    throw new Error(`Status callback failed (${response.status}): ${body}`)
  }
}

module.exports = { updateDeploymentStatus }
