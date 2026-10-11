import { Badge } from "@dev-hoster/ui/components/badge"
import { cn } from "@dev-hoster/ui/lib/utils"
import { CircleCheck, CircleX, Clock, Loader } from "lucide-react"
import type { DeploymentStatus } from "@/lib/types"

// Status is the product's vocabulary: always an icon + a label, never colour alone.
const STATUS: Record<
  DeploymentStatus,
  { label: string; icon: typeof Clock; className: string; spin?: boolean }
> = {
  QUEUED: {
    label: "Queued",
    icon: Clock,
    className: "bg-muted text-muted-foreground",
  },
  BUILDING: {
    label: "Building",
    icon: Loader,
    className: "bg-primary/12 text-accent-foreground dark:text-primary",
    spin: true,
  },
  READY: {
    label: "Ready",
    icon: CircleCheck,
    className: "bg-success/12 text-success",
  },
  FAILED: {
    label: "Failed",
    icon: CircleX,
    className: "bg-destructive/10 text-destructive",
  },
}

export function StatusBadge({
  status,
  className,
}: {
  status: DeploymentStatus
  className?: string
}) {
  const s = STATUS[status]
  const Icon = s.icon
  return (
    <Badge
      variant="outline"
      className={cn("border-transparent font-medium", s.className, className)}
    >
      <Icon aria-hidden className={cn(s.spin && "animate-spin")} />
      {s.label}
    </Badge>
  )
}
