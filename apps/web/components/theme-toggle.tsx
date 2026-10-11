"use client"

import { useTheme } from "next-themes"
import { Moon, Sun } from "lucide-react"
import { SidebarMenuButton } from "@dev-hoster/ui/components/sidebar"

/** Both icons render; CSS shows the right one, so there is no hydration flash. */
export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  return (
    <SidebarMenuButton
      tooltip="Toggle theme (D)"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
    >
      <Sun className="dark:hidden" />
      <Moon className="hidden dark:block" />
      <span>Theme</span>
      <kbd className="ml-auto border px-1 font-mono text-[10px] text-muted-foreground group-data-[collapsible=icon]:hidden">
        D
      </kbd>
    </SidebarMenuButton>
  )
}
