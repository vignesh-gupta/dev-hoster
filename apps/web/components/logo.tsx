import { cn } from "@dev-hoster/ui/lib/utils"

/** Orange square with an upward chevron: "ship it". */
export function LogoMark({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "flex size-6 shrink-0 items-center justify-center bg-primary text-primary-foreground",
        className
      )}
    >
      <svg viewBox="0 0 16 16" className="size-3.5" fill="none">
        <path
          d="M3 10.5 8 5l5 5.5"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="square"
        />
      </svg>
    </span>
  )
}
