import { cn } from "@dev-hoster/ui/lib/utils"
import type { LucideIcon } from "lucide-react"

/** Empty states teach the next step instead of saying "nothing here". */
export function EmptyState({
  icon: Icon,
  title,
  description,
  children,
  className,
}: {
  icon: LucideIcon
  title: string
  description?: React.ReactNode
  children?: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-3 border border-dashed px-6 py-12 text-center",
        className
      )}
    >
      <div className="flex size-9 items-center justify-center bg-primary/10 text-accent-foreground dark:text-primary">
        <Icon aria-hidden className="size-4.5" />
      </div>
      <div className="max-w-sm space-y-1">
        <h3 className="text-sm font-medium">{title}</h3>
        {description && (
          <p className="text-xs/relaxed text-muted-foreground">{description}</p>
        )}
      </div>
      {children}
    </div>
  )
}
