"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@dev-hoster/ui/lib/utils"

const ITEMS = [
  { label: "General", path: "" },
  { label: "Environment", path: "/env" },
  { label: "Domains", path: "/domains" },
]

export function SettingsNav({ slug }: { slug: string }) {
  const pathname = usePathname()
  const base = `/projects/${slug}/settings`
  return (
    <nav
      aria-label="Project settings"
      className="flex gap-1 overflow-x-auto md:flex-col md:overflow-visible"
    >
      {ITEMS.map((item) => {
        const href = base + item.path
        const active = pathname === href
        return (
          <Link
            key={item.label}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "px-2.5 py-1.5 text-xs font-medium whitespace-nowrap transition-colors outline-none focus-visible:ring-1 focus-visible:ring-ring",
              active
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}
