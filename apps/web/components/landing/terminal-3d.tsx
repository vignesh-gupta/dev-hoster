"use client"

import { useEffect, useState } from "react"
import { CircleCheck } from "lucide-react"
import { useInView, usePointerTilt, useReducedMotion } from "@/components/landing/hooks"

const LINES: { t: string; tone?: "dim" | "ok" | "cmd" }[] = [
  { t: "Cloning github.com/vignesh/portfolio-site#main", tone: "dim" },
  { t: "Cloned repository (commit d814c18)", tone: "dim" },
  { t: "Detected package manager: npm", tone: "dim" },
  { t: "Injecting 2 environment variable(s)", tone: "dim" },
  { t: "$ npm install", tone: "cmd" },
  { t: "added 312 packages in 8s", tone: "dim" },
  { t: "$ npm run build", tone: "cmd" },
  { t: "✓ 134 modules transformed.", tone: "ok" },
  { t: "dist/index.html          0.46 kB", tone: "dim" },
  { t: "dist/assets/index.js   143.20 kB", tone: "dim" },
  { t: "Uploaded 5 files", tone: "dim" },
  { t: "Deployment ready", tone: "ok" },
]

/** A tilting 3D terminal that types out a build, with floating chips for depth. */
export function Terminal3D() {
  const tilt = usePointerTilt<HTMLDivElement>()
  const [ref, inView] = useInView<HTMLDivElement>(false)
  const reduced = useReducedMotion()
  const [n, setN] = useState(LINES.length)

  useEffect(() => {
    if (reduced || !inView) return
    let i = 0
    setN(0)
    let timer: ReturnType<typeof setTimeout>
    const step = () => {
      if (i >= LINES.length) {
        i = 0
        setN(0)
        timer = setTimeout(step, 700)
        return
      }
      i += 1
      setN(i)
      timer = setTimeout(step, i >= LINES.length ? 3200 : 340 + (i % 3) * 90)
    }
    timer = setTimeout(step, 500)
    return () => clearTimeout(timer)
  }, [inView, reduced])

  const done = n >= LINES.length

  return (
    <div ref={ref} className="term-stage relative mx-auto w-full max-w-3xl py-10">
      <div ref={tilt} className="term relative">
        <div className="term-win bg-[var(--l-ink)] text-[var(--l-concrete)]">
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-2.5">
            <div className="flex items-center gap-1.5" aria-hidden>
              <span className="size-2.5 bg-[var(--l-red)]" />
              <span className="size-2.5 bg-[oklch(0.85_0.15_90)]" />
              <span className="size-2.5 bg-[var(--l-green)]" />
            </div>
            <p className="font-mono-l text-xs text-white/60">
              build · portfolio-site · d814c1
            </p>
            <span className="w-10" />
          </div>
          <div
            role="log"
            aria-label="Example build log"
            className="font-mono-l min-h-[21rem] space-y-0.5 px-4 py-4 text-[13px] leading-6"
          >
            {LINES.slice(0, n).map((l, i) => (
              <div key={i} className="flex gap-3">
                <span aria-hidden className="w-5 shrink-0 text-right text-white/30 tabular-nums">
                  {i + 1}
                </span>
                <span
                  className={
                    l.tone === "ok"
                      ? "text-[var(--l-green)]"
                      : l.tone === "cmd"
                        ? "font-bold text-[var(--l-orange)]"
                        : "text-white/75"
                  }
                >
                  {l.t}
                </span>
              </div>
            ))}
            {!done && (
              <div className="flex gap-3">
                <span className="w-5" />
                <span className="cursor-blink inline-block h-4 w-2 bg-[var(--l-orange)]" />
              </div>
            )}
          </div>
        </div>

        {/* floating layers sit in front of the window in Z */}
        <div
          aria-hidden
          className="term-float -top-5 right-6 hidden items-center gap-1.5 bg-[var(--l-green)] px-3 py-1.5 text-xs font-extrabold uppercase text-[var(--l-ink)] transition-opacity duration-300 sm:flex"
          style={{ transform: "translateZ(70px)", opacity: done ? 1 : 0.35, fontStretch: "112%" }}
        >
          <CircleCheck className="size-3.5" /> Ready
        </div>
        <div
          aria-hidden
          className="term-float font-mono-l -bottom-6 left-6 hidden bg-[var(--l-concrete)] px-3 py-2 text-xs font-bold text-[var(--l-ink)] sm:block"
          style={{ transform: "translateZ(110px)" }}
        >
          portfolio-site.localhost:8000
        </div>
      </div>
    </div>
  )
}
