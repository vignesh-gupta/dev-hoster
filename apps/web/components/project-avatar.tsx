import { cn } from "@dev-hoster/ui/lib/utils"

export function ProjectAvatar({
  name,
  className,
}: {
  name: string
  className?: string
}) {
  return (
    <span
      aria-hidden
      className={cn(
        "flex size-7 shrink-0 items-center justify-center bg-primary/12 text-xs font-semibold text-accent-foreground uppercase dark:text-primary",
        className
      )}
    >
      {name.trim().slice(0, 1) || "?"}
    </span>
  )
}
