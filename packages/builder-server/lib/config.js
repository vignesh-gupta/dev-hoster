const { S3Client } = require("@aws-sdk/client-s3")
const Redis = require("ioredis")

const PROJECT_ID = process.env.PROJECT_ID
const DEPLOYMENT_ID = process.env.DEPLOYMENT_ID
const LOG_CHANNEL = `logs:${DEPLOYMENT_ID || PROJECT_ID || "unknown"}`

let publisher
const pendingPublishes = new Set()
if (process.env.REDIS_URL) {
  publisher = new Redis(process.env.REDIS_URL)
}

function publishEvent(event) {
  if (!publisher) return

  const publish = publisher
    .publish(
      LOG_CHANNEL,
      JSON.stringify({
        deploymentId: DEPLOYMENT_ID,
        projectId: PROJECT_ID,
        timestamp: new Date().toISOString(),
        ...event,
      })
    )
    .catch((err) => console.error("Failed to publish log event", err))
    .finally(() => pendingPublishes.delete(publish))
  pendingPublishes.add(publish)
}

function publishLog(log) {
  const message = String(log).trimEnd()
  console.log(message)
  publishEvent({ type: "log", message })
}

function publishStatus(status) {
  publishEvent({ type: "status", status })
}

async function closePublisher() {
  if (!publisher) return
  await Promise.allSettled(pendingPublishes)
  await publisher.quit()
}

const s3Client = new S3Client({
  endpoint: process.env.AWS_ENDPOINT_URL || "http://host.docker.internal:4566",
  region: "us-east-1",
  forcePathStyle: true,
})

async function sendS3Command(command) {
  try {
    await s3Client.send(command)
  } catch (err) {
    console.error(err)
    publishLog(`Error: ${err}`)
  }
}

module.exports = { sendS3Command, publishLog, publishStatus, closePublisher }
