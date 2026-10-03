import { Badge } from "@dev-hoster/ui/components/badge";
import { cn } from "@dev-hoster/ui/lib/utils";

const STATUS_STYLES: Record<string, string> = {
  QUEUED: "bg-muted text-muted-foreground",
  BUILDING: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
  READY: "bg-green-500/15 text-green-600 dark:text-green-400",
  FAILED: "bg-red-500/15 text-red-600 dark:text-red-400",
};

const STATUS_LABEL: Record<string, string> = {
  QUEUED: "Queued",
  BUILDING: "Building",
  READY: "Ready",
  FAILED: "Failed",
};

export function DeploymentStatusBadge({ status }: { status: string }) {
  return (
    <Badge variant="outline" className={cn("border-0 font-medium", STATUS_STYLES[status])}>
      {STATUS_LABEL[status] ?? status}
    </Badge>
  );
}
