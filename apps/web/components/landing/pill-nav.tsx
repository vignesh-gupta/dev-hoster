"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { LogoMark } from "@/components/logo"

const LINKS = [
  ["Pipeline", "#pipeline"],
  ["Logs", "#logs"],
  ["Features", "#features"],
  ["API", "#api"],
]

/**
 * Floating pill. Past 48px of scroll it narrows and folds away its secondary
 * links, leaving the logo, a hint of nav and the primary action.
 */
export function PillNav() {
  const [compact, setCompact] = useState(false)

  useEffect(() => {
    let raf = 0
    const update = () => {
      raf = 0
      setCompact(window.scrollY > 48)
    }
    const onScroll = () => {
      raf ||= requestAnimationFrame(update)
    }
    update()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => {
      window.removeEventListener("scroll", onScroll)
      cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <header className="pointer-events-none fixed inset-x-0 top-3 z-50 flex justify-center px-3">
      <nav aria-label="Primary" data-compact={compact} className="pill pointer-events-auto">
        <Link href="/" className="flex shrink-0 items-center gap-2 rounded-full pr-1 outline-none focus-visible:ring-2 focus-visible:ring-[var(--l-orange-hi)]">
          <LogoMark className="size-7" />
          <span className="text-sm font-extrabold tracking-tight uppercase" style={{ fontStretch: "112%" }}>
            Dev Hoster
          </span>
        </Link>

        <div className="hidden md:block">
          <div className="pill-fold">
            {LINKS.map(([label, href]) => (
              <a key={href} href={href} className="pill-link outline-none" tabIndex={compact ? -1 : 0}>
                {label}
              </a>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-1">
          <div className="hidden sm:block">
            <div className="pill-fold">
              <Link href="/login" className="pill-link" tabIndex={compact ? -1 : 0}>
                Sign in
              </Link>
            </div>
          </div>
          <Link href="/dashboard" className="btn-l btn-orange">
            <span className="sm:hidden">Dashboard</span>
            <span className="hidden sm:inline">Open dashboard</span>
          </Link>
        </div>
      </nav>
    </header>
  )
}
