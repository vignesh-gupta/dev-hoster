"use client"

import { useEffect, useRef, useState } from "react"

/**
 * Scroll reveal that enhances an already-visible default: content renders
 * visible on the server and only becomes hidden-then-revealed after hydration.
 * Uses a cheap rect check on scroll (not IntersectionObserver) so a throttled or
 * occluded tab can never leave a section stuck invisible.
 */
export function Reveal({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode
  className?: string
  delay?: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [ready, setReady] = useState(false)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    let raf = 0
    const check = () => {
      raf = 0
      const r = el.getBoundingClientRect()
      if (r.top < window.innerHeight * 0.92 && r.bottom > 0) {
        setInView(true)
        window.removeEventListener("scroll", onScroll)
        window.removeEventListener("resize", onScroll)
      }
    }
    const onScroll = () => {
      raf ||= requestAnimationFrame(check)
    }
    // Decide the initial state before hiding anything: if it is already on
    // screen, reveal immediately (no hide/show flash).
    const r = el.getBoundingClientRect()
    const already = r.top < window.innerHeight * 0.92 && r.bottom > 0
    setReady(true)
    if (already) setInView(true)
    else {
      window.addEventListener("scroll", onScroll, { passive: true })
      window.addEventListener("resize", onScroll)
    }
    return () => {
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("resize", onScroll)
      cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <div
      ref={ref}
      data-reveal
      data-reveal-ready={ready}
      data-in={inView}
      className={className}
      style={{ transitionDelay: inView ? `${delay}ms` : undefined }}
    >
      {children}
    </div>
  )
}
