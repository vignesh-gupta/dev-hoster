const path = require("path")
const fs = require("fs")
const { PutObjectCommand } = require("@aws-sdk/client-s3")
const mime = require("mime-types")
const { publishLog, sendS3Command } = require("./config")

const BUCKET_NAME = process.env.AWS_BUCKET_NAME || "simple-vercel-output"

async function uploadDist(
  distFolderPath,
  projectId,
  deploymentId,
  bucket = BUCKET_NAME
) {
  const distFolderContents = fs.readdirSync(distFolderPath, { recursive: true })

  const s3Key = `__outputs/${projectId}/${deploymentId}`

  publishLog("Starting Upload to" + ` s3://${bucket}/${s3Key}...`)

  const uploadPromises = distFolderContents.map(async (file) => {
    const filePath = path.join(distFolderPath, file)
    if (fs.lstatSync(filePath).isDirectory()) return

    publishLog(`Uploading ${filePath}...`)

    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: `${s3Key}/${file}`,
      Body: fs.createReadStream(filePath),
      ContentType: mime.lookup(filePath),
    })
    await sendS3Command(command)
    publishLog(`Uploaded ${filePath}`)
  })

  await Promise.all(uploadPromises)

  publishLog("Done...")
  return `s3://${bucket}/__outputs/${projectId}`
}

async function uploadLambdaZip(
  zipFilePath,
  projectId,
  deploymentId,
  bucket = BUCKET_NAME
) {
  const s3Key = `__lambdas/${projectId}/${deploymentId}/lambda.zip`
  publishLog(`Uploading Lambda package to s3://${bucket}/${s3Key}...`)
  await sendS3Command(
    new PutObjectCommand({
      Bucket: bucket,
      Key: s3Key,
      Body: fs.createReadStream(zipFilePath),
      ContentType: "application/zip",
    })
  )
  publishLog("Lambda package uploaded")
  return s3Key
}

module.exports = { uploadDist, uploadLambdaZip }
