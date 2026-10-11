"use client"

import { useEffect, useRef } from "react"
import { useReducedMotion } from "@/components/landing/hooks"

const SLABS = [
  { title: "Repo", meta: "connected\nbranch main" },
  { title: "Build", meta: "runs on\nevery push" },
  { title: "Deploy", meta: "every version\nis kept" },
  { title: "Live", meta: "your-project\nis online" },
]

const clamp = (n: number, a = 0, b = 1) => Math.min(Math.max(n, a), b)
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3)

/**
 * Isometric hosting pipeline. Each slab is a CSS 3D box and the orange cube is
 * "your app" travelling through them. One rAF loop (paused off-screen) writes a
 * handful of custom properties that landing.css turns into transforms.
 *
 * mode="hero":  pointer parallax + scroll "explode"; the app hovers over the
 *               Live layer, bobbing up and down.
 * mode="story": driven by scroll progress through the nearest [data-story];
 *               layers drop in from above/the side as the app reaches them.
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
      el.style.setProperty(
        "--s",
        String(Math.min(el.clientWidth / 560, 1.3) * (mode === "story" ? 0.8 : 1))
      )
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
        const gap = 100 + ex * 90
        // The app hovers over the Live layer only: a gentle up-and-down bob.
        const phase = ((now - t0) % 3400) / 3400
        const lift = (1 - Math.cos(phase * Math.PI * 2)) / 2
        const liveTop = 3 * gap - 130
        pz = reduced ? liveTop : liveTop + lift * 78
      } else {
        const gap = 100 + 0.55 * 90
        ex = 0.55
        mx = (p - 0.5) * 1.7
        my = 0
        pz = -130 + p * 3 * gap
        el.dataset.stage = String(Math.min(3, Math.floor(p * 4)))
        // Layers arrive from above/the side just before the app reaches them.
        for (let i = 1; i < 4; i++) {
          const start = (i - 1) * 0.25
          el.style.setProperty(
            `--in-${i}`,
            easeOut(clamp((p - start) / 0.2)).toFixed(3)
          )
        }
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
            <div
              key={s.title}
              className="slab"
              data-i={i}
              style={
                { "--i": i, "--in": `var(--in-${i}, 1)` } as React.CSSProperties
              }
            >
              <i className="shadow" />
              <i className="front">
                <span className="slab-side font-mono-l">{s.meta.split("\n").join(" · ")}</span>
              </i>
              <i className="right" />
              <i className="top">
                <span className="slab-label">
                  <span className="slab-title">{s.title}</span>
                </span>
              </i>
            </div>
          ))}
          {/* the app: a cube with the product mark on its lid */}
          <div className="packet">
            <i className="shadow-p" />
            <i className="f" />
            <i className="r" />
            <i className="t">
              <svg viewBox="0 0 16 16" className="size-7" fill="none">
                <path d="M3 10.5 8 5l5 5.5" stroke="currentColor" strokeWidth="2.4" strokeLinecap="square" />
              </svg>
            </i>
          </div>
        </div>
      </div>
    </div>
  )
}
