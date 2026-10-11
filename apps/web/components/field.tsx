import { Label } from "@dev-hoster/ui/components/label"
import { cn } from "@dev-hoster/ui/lib/utils"
import { useId } from "react"

/** Label + control + hint/error, wired for screen readers. */
export function Field({
  label,
  hint,
  error,
  required,
  className,
  children,
}: {
  label: string
  hint?: React.ReactNode
  error?: string
  required?: boolean
  className?: string
  children: (props: {
    id: string
    "aria-invalid": boolean
    "aria-describedby": string | undefined
  }) => React.ReactNode
}) {
  const id = useId()
  const descId = error || hint ? `${id}-desc` : undefined
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label htmlFor={id}>
        {label}
        {required && (
          <span aria-hidden className="text-destructive">
            *
          </span>
        )}
      </Label>
      {children({
        id,
        "aria-invalid": !!error,
        "aria-describedby": descId,
      })}
      {(error || hint) && (
        <p
          id={descId}
          role={error ? "alert" : undefined}
          className={cn(
            "text-[11px]/relaxed",
            error ? "text-destructive" : "text-muted-foreground"
          )}
        >
          {error ?? hint}
        </p>
      )}
    </div>
  )
}
