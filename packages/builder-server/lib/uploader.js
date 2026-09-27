const path = require("path")
const fs = require("fs")
const { PutObjectCommand } = require("@aws-sdk/client-s3")
const mime = require("mime-types")
const { publishLog, sendS3Command } = require("./config")

const BUCKET_NAME = process.env.AWS_BUCKET_NAME || "simple-vercel-output"

async function uploadDist(distFolderPath, projectId, bucket = BUCKET_NAME) {
  const distFolderContents = fs.readdirSync(distFolderPath, { recursive: true })

  publishLog("Starting Upload")

  for (const file of distFolderContents) {
    const filePath = path.join(distFolderPath, file)
    if (fs.lstatSync(filePath).isDirectory()) continue

    publishLog(`Uploading ${filePath}...`)
    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: `__outputs/${projectId}/${file}`,
      Body: fs.createReadStream(filePath),
      ContentType: mime.lookup(filePath),
    })
    await sendS3Command(command)
    publishLog(`Uploaded ${filePath}`)
  }

  publishLog("Done...")
}

module.exports = { uploadDist }