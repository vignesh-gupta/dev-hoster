import { Badge } from "@dev-hoster/ui/components/badge"

/** Marks the deployment currently served at the project's URL. */
export function LiveBadge() {
  return (
    <Badge className="bg-primary text-primary-foreground">
      <span aria-hidden className="size-1.5 rounded-full bg-current" />
      Live
    </Badge>
  )
}
