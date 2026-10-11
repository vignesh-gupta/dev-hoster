import { cn } from "@dev-hoster/ui/lib/utils"

export function PageHeader({
  title,
  description,
  actions,
  className,
}: {
  title: React.ReactNode
  description?: React.ReactNode
  actions?: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-start justify-between gap-x-4 gap-y-3",
        className
      )}
    >
      <div className="min-w-0 space-y-1">
        <h1 className="text-lg font-semibold tracking-tight text-balance">
          {title}
        </h1>
        {description && (
          <p className="max-w-prose text-xs/relaxed text-muted-foreground">
            {description}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex flex-wrap items-center gap-2">{actions}</div>
      )}
    </div>
  )
}
