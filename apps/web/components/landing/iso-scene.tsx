"use client"

import { useEffect, useRef } from "react"
import { useReducedMotion } from "@/components/landing/hooks"

const SLABS = [
  { title: "Git", meta: "clone\nmain@d814c1" },
  { title: "Build", meta: "npm run build\n134 modules" },
  { title: "S3", meta: "dist/ → bucket\n5 files" },
  { title: "Live", meta: "portfolio-site\n.localhost:8000" },
]

const clamp = (n: number, a = 0, b = 1) => Math.min(Math.max(n, a), b)

/**
 * Isometric build pipeline. Each slab is a CSS 3D box. One rAF loop (paused
 * off-screen) writes a handful of custom properties that landing.css turns into
 * transforms: pointer parallax, scroll "explode", and a packet riding upward.
 *
 * mode="hero":  reacts to pointer + page scroll.
 * mode="story": driven by scroll progress through the nearest [data-story].
 */
export function IsoScene({
  mode,
  className,
}: {
  mode: "hero" | "story"
  className?: string
}) {
  const root = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()

  useEffect(() => {
    const el = root.current
    if (!el) return
    const story = el.closest<HTMLElement>("[data-story]")
    let raf = 0
    let visible = true
    const target = { x: 0, y: 0 }
    const cur = { x: 0, y: 0 }
    const t0 = performance.now()

    const size = () =>
      el.style.setProperty("--s", String(Math.min(el.clientWidth / 560, 1.3) * (mode === "story" ? 0.8 : 1)))
    size()
    const ro = new ResizeObserver(size)
    ro.observe(el)

    const progress = () => {
      if (mode === "hero") return clamp(window.scrollY / (window.innerHeight * 0.9))
      if (!story) return 0
      const r = story.getBoundingClientRect()
      return clamp(-r.top / (r.height - window.innerHeight))
    }

    const tick = (now: number) => {
      raf = 0
      const p = progress()
      let ex: number, mx: number, my: number, pz: number
      if (mode === "hero") {
        ex = p * 0.95
        cur.x += (target.x - cur.x) * 0.07
        cur.y += (target.y - cur.y) * 0.07
        mx = cur.x
        my = cur.y
        const gap = 78 + ex * 100
        const phase = ((now - t0) % 5200) / 5200
        const eased = 1 - Math.pow(1 - clamp(phase / 0.78), 3)
        pz = reduced ? 3 * gap - 100 : -100 + eased * 3 * gap
      } else {
        ex = 0.55
        mx = (p - 0.5) * 1.7
        my = 0
        pz = -100 + p * 3 * (78 + ex * 100)
        el.dataset.stage = String(Math.min(3, Math.floor(p * 4)))
      }
      el.style.setProperty("--ex", ex.toFixed(3))
      el.style.setProperty("--mx", mx.toFixed(3))
      el.style.setProperty("--my", my.toFixed(3))
      el.style.setProperty("--pz", pz.toFixed(1))
      if (visible && !reduced) raf = requestAnimationFrame(tick)
    }
    const kick = () => {
      if (!raf) raf = requestAnimationFrame(tick)
    }

    const io = new IntersectionObserver(([e]) => {
      visible = !!e?.isIntersecting
      if (visible) kick()
    })
    io.observe(el)

    const onMove = (e: PointerEvent) => {
      target.x = (e.clientX / window.innerWidth) * 2 - 1
      target.y = (e.clientY / window.innerHeight) * 2 - 1
    }
    if (mode === "hero" && !reduced) {
      window.addEventListener("pointermove", onMove, { passive: true })
    }
    // Reduced motion: no loop, but still follow scroll (user-driven).
    if (reduced) window.addEventListener("scroll", kick, { passive: true })

    tick(t0)
    return () => {
      cancelAnimationFrame(raf)
      io.disconnect()
      ro.disconnect()
      window.removeEventListener("pointermove", onMove)
      window.removeEventListener("scroll", kick)
    }
  }, [mode, reduced])

  return (
    <div
      ref={root}
      data-mode={mode}
      data-stage="0"
      aria-hidden
      className={"iso " + (className ?? "")}
    >
      <div className="iso-world">
        <div className="iso-float">
          {SLABS.map((s, i) => (
            <div key={s.title} className="slab" data-i={i} style={{ "--i": i } as React.CSSProperties}>
              <i className="shadow" />
              <i className="front" />
              <i className="right" />
              <i className="top">
                <span className="slab-label">
                  <span className="slab-title">{s.title}</span>
                  <span className="slab-meta font-mono-l whitespace-pre">{s.meta}</span>
                </span>
              </i>
            </div>
          ))}
          <div className="packet">
            <i className="t" />
            <i className="f" />
            <i className="r" />
          </div>
        </div>
      </div>
    </div>
  )
}
