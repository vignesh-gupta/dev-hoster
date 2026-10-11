"use client"

import { useRouter } from "next/navigation"
import { Button } from "@dev-hoster/ui/components/button"
import { Rocket } from "lucide-react"
import { toast } from "sonner"
import { useTriggerDeployment } from "@/lib/api/hooks"

/** Queues a new deployment, then jumps to its live build log. */
export function DeployButton({
  slug,
  branch,
  commitSha,
  variant = "default",
  size = "default",
  children = "Deploy",
}: {
  slug: string
  branch?: string
  commitSha?: string
  variant?: React.ComponentProps<typeof Button>["variant"]
  size?: React.ComponentProps<typeof Button>["size"]
  children?: React.ReactNode
}) {
  const router = useRouter()
  const trigger = useTriggerDeployment(slug)

  return (
    <Button
      variant={variant}
      size={size}
      disabled={trigger.isPending}
      onClick={() =>
        trigger.mutate(
          { branch, commitSha },
          {
            onSuccess: (d) => {
              toast.success("Deployment queued", { description: d.slug })
              router.push(`/projects/${slug}/deployments/${d.slug}`)
            },
            onError: (e) => toast.error(e.message),
          }
        )
      }
    >
      <Rocket aria-hidden />
      {trigger.isPending ? "Queuing…" : children}
    </Button>
  )
}
