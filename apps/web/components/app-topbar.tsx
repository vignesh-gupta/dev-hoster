"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { SidebarTrigger } from "@dev-hoster/ui/components/sidebar"
import { Separator } from "@dev-hoster/ui/components/separator"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@dev-hoster/ui/components/breadcrumb"
import { Fragment } from "react"

const LABELS: Record<string, string> = {
  dashboard: "Dashboard",
  projects: "Projects",
  deployments: "Deployments",
  settings: "Settings",
  env: "Environment",
  domains: "Domains",
  new: "New project",
}

// Segments whose value is user data (a slug), rendered in monospace.
function crumbs(pathname: string) {
  const parts = pathname.split("/").filter(Boolean)
  if (parts.length === 0) return [{ label: "Home", href: "/", mono: false }]
  return parts.map((part, i) => ({
    label: LABELS[part] ?? part,
    href: "/" + parts.slice(0, i + 1).join("/"),
    mono: !(part in LABELS),
  }))
}

export function AppTopbar() {
  const items = crumbs(usePathname())
  return (
    <header className="sticky top-0 z-20 flex h-11 shrink-0 items-center gap-2 border-b bg-background/95 px-3 backdrop-blur-sm supports-[backdrop-filter]:bg-background/80">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-1 h-4" />
      <Breadcrumb>
        <BreadcrumbList>
          {items.map((c, i) => {
            const last = i === items.length - 1
            return (
              <Fragment key={c.href}>
                {i > 0 && <BreadcrumbSeparator />}
                <BreadcrumbItem>
                  {last ? (
                    <BreadcrumbPage className={c.mono ? "font-mono" : undefined}>
                      {c.label}
                    </BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink
                      render={<Link href={c.href} />}
                      className={c.mono ? "font-mono" : undefined}
                    >
                      {c.label}
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
              </Fragment>
            )
          })}
        </BreadcrumbList>
      </Breadcrumb>
    </header>
  )
}
