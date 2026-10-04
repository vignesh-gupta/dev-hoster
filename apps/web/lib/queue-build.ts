import { ECSClient, LaunchType, RunTaskCommand } from "@aws-sdk/client-ecs"

type QueueBuildInput = {
  projectId: string
  deploymentId: string
  repoUrl: string
}

function getCsvEnv(name: string): string[] | undefined {
  const value = process.env[name]
  if (!value) return undefined

  const items = value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)

  return items.length ? items : undefined
}

function getLaunchType(): LaunchType {
  const launchType = process.env.ECS_LAUNCH_TYPE ?? LaunchType.FARGATE

  if (launchType === LaunchType.EC2) return LaunchType.EC2
  if (launchType === LaunchType.EXTERNAL) return LaunchType.EXTERNAL
  if (launchType === LaunchType.FARGATE) return LaunchType.FARGATE
  if (launchType === LaunchType.MANAGED_INSTANCES) {
    return LaunchType.MANAGED_INSTANCES
  }

  throw new Error(`Unsupported ECS_LAUNCH_TYPE: ${launchType}`)
}

export async function queueBuild({
  projectId,
  deploymentId,
  repoUrl,
}: QueueBuildInput): Promise<void> {
  const endpointUrl = process.env.AWS_ENDPOINT_URL ?? "http://localhost:4566"
  const region = process.env.AWS_REGION ?? "us-east-1"
  const cluster = process.env.ECS_CLUSTER ?? "default"
  const taskDefinition =
    process.env.ECS_TASK_DEFINITION ?? "builder-server-task"
  const containerName = process.env.ECS_CONTAINER_NAME ?? "builder-server"
  const launchType = getLaunchType()
  const subnets = getCsvEnv("ECS_VPC_SUBNETS")
  const securityGroups = getCsvEnv("ECS_SECURITY_GROUPS")

  const ecs = new ECSClient({
    endpoint: endpointUrl,
    region,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? "test",
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? "test",
    }
  })

  const result = await ecs.send(
    new RunTaskCommand({
      cluster,
      taskDefinition,
      launchType,
      count: 1,
      ...(subnets
        ? {
            networkConfiguration: {
              awsvpcConfiguration: {
                subnets,
                securityGroups,
                assignPublicIp: "ENABLED",
              },
            },
          }
        : {}),
      overrides: {
        containerOverrides: [
          {
            name: containerName,
            environment: [
              { name: "GIT_REPOSITORY__URL", value: repoUrl },
              { name: "PROJECT_ID", value: projectId },
              { name: "DEPLOYMENT_ID", value: deploymentId },
            ],
          },
        ],
      },
    })
  )

  if (result.failures?.length) {
    const reason = result.failures
      .map((failure) => failure.reason ?? failure.detail ?? failure.arn)
      .filter(Boolean)
      .join(", ")
    throw new Error(
      `Failed to run builder task: ${reason || "unknown ECS failure"}`
    )
  }
}
