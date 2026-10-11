import { cn } from "@dev-hoster/ui/lib/utils"

/** A bordered, titled block. Flat (no shadow), used instead of nested cards. */
export function Section({
  title,
  description,
  actions,
  children,
  className,
  bodyClassName,
}: {
  title?: React.ReactNode
  description?: React.ReactNode
  actions?: React.ReactNode
  children: React.ReactNode
  className?: string
  bodyClassName?: string
}) {
  return (
    <section className={cn("border bg-card", className)}>
      {(title || actions) && (
        <header className="flex items-center justify-between gap-3 border-b px-3 py-2">
          <div className="min-w-0">
            <h2 className="text-xs font-semibold">{title}</h2>
            {description && (
              <p className="text-xs text-muted-foreground">{description}</p>
            )}
          </div>
          {actions}
        </header>
      )}
      <div className={bodyClassName}>{children}</div>
    </section>
  )
}
