"use client"

import { useEffect, useState } from "react"
import { useTheme } from "next-themes"
import { Button } from "@dev-hoster/ui/components/button"
import { cn } from "@dev-hoster/ui/lib/utils"
import { Monitor, Moon, Sun } from "lucide-react"
import { useMe } from "@/lib/api/hooks"
import { CopyButton } from "@/components/copy-button"
import { PageHeader } from "@/components/page-header"
import { Section } from "@/components/section"

const THEMES = [
  ["light", Sun, "Light"],
  ["dark", Moon, "Dark"],
  ["system", Monitor, "System"],
] as const

export function SettingsView() {
  const { theme, setTheme } = useTheme()
  const me = useMe().data
  // next-themes only knows the stored theme after mount.
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  return (
    <>
      <PageHeader title="Settings" description="Preferences for this workspace." />

      <div className="grid max-w-2xl gap-5">
        <Section title="Appearance" description="Press D anywhere to toggle light and dark.">
          <div className="flex gap-2 p-3" role="group" aria-label="Theme">
            {THEMES.map(([value, Icon, label]) => (
              <Button
                key={value}
                variant="outline"
                aria-pressed={mounted && theme === value}
                onClick={() => setTheme(value)}
                className={cn(
                  mounted && theme === value && "border-primary bg-accent text-accent-foreground"
                )}
              >
                <Icon /> {label}
              </Button>
            ))}
          </div>
        </Section>

        <Section title="Account">
          {/* TODO-AUTH: replace with the signed-in user's profile and a sign-out action. */}
          <dl className="divide-y text-xs">
            <div className="flex justify-between gap-3 px-3 py-2">
              <dt className="text-muted-foreground">Name</dt>
              <dd>{me?.name ?? "Default User"}</dd>
            </div>
            <div className="flex justify-between gap-3 px-3 py-2">
              <dt className="text-muted-foreground">User ID</dt>
              <dd className="font-mono">{me?.id ?? 0}</dd>
            </div>
            <div className="px-3 py-2 text-muted-foreground">
              Sign-in is not enabled yet. Everything in this workspace belongs
              to one default user.
            </div>
          </dl>
        </Section>

        <Section
          title="API"
          description="Everything in this app runs through the REST API, so a CLI can use the same endpoints."
        >
          <div className="flex items-center gap-1 px-3 py-2.5">
            <code className="font-mono text-xs">/api/projects</code>
            <CopyButton value="/api/projects" label="Copy path" />
          </div>
        </Section>
      </div>
    </>
  )
}
