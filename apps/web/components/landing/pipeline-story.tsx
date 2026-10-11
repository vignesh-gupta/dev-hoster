"use client"

import { useEffect, useRef } from "react"
import { IsoScene } from "@/components/landing/iso-scene"

const STEPS = [
  {
    title: "Connect",
    body: "Link your Git repository once and choose the branch you want online.",
  },
  {
    title: "Build",
    body: "Every push starts a fresh build automatically. Watch it happen, line by line.",
  },
  {
    title: "Deploy",
    body: "Builds that succeed are deployed for you. Every version is kept, so you can go back any time.",
  },
  {
    title: "Live",
    body: "Your site goes online at its own address. If a build fails, the current version keeps running.",
  },
]

/**
 * Pinned scroll story: the section is 400vh tall and the content sticks while
 * the isometric scene (driven by the same scroll progress) climbs through the
 * four stages.
 */
export function PipelineStory() {
  const section = useRef<HTMLElement>(null)
  const rail = useRef<HTMLDivElement>(null)
  const list = useRef<HTMLOListElement>(null)

  // Highlight the active step + fill the progress rail without re-rendering.
  useEffect(() => {
    const sec = section.current
    if (!sec) return
    let raf = 0
    const update = () => {
      raf = 0
      const r = sec.getBoundingClientRect()
      const p = Math.min(Math.max(-r.top / (r.height - window.innerHeight), 0), 1)
      const stage = Math.min(3, Math.floor(p * 4))
      rail.current?.style.setProperty("--fill", String(p))
      list.current?.querySelectorAll<HTMLElement>("li").forEach((li, i) => {
        li.dataset.active = String(i === stage)
        li.dataset.done = String(i < stage)
      })
    }
    const onScroll = () => {
      raf ||= requestAnimationFrame(update)
    }
    update()
    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("resize", onScroll)
    return () => {
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("resize", onScroll)
      cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <section
      id="pipeline"
      ref={section}
      data-story
      className="relative bg-[var(--l-ink)] text-[var(--l-concrete)]"
      style={{ height: "380svh" }}
    >
      <div className="sticky top-0 flex h-svh items-center overflow-hidden px-5 pt-14 sm:px-8 sm:pt-0">
        <div className="mx-auto grid w-full max-w-7xl items-center gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <div>
            <h2 className="display display-lg">
              From push
              <br />
              to <span className="text-[var(--l-orange)]">live site</span>
              <br />
              in four steps.
            </h2>

            <div className="relative mt-8 pl-6">
              <div
                ref={rail}
                aria-hidden
                className="absolute top-1 bottom-1 left-0 w-0.5 bg-white/15"
                style={{ "--fill": 0 } as React.CSSProperties}
              >
                <div
                  className="absolute inset-x-0 top-0 origin-top bg-[var(--l-orange)]"
                  style={{ height: "100%", transform: "scaleY(var(--fill))" }}
                />
              </div>
              <ol ref={list} className="space-y-4">
                {STEPS.map((s, i) => (
                  <li
                    key={s.title}
                    data-active={i === 0}
                    className="group transition-opacity duration-300 data-[active=false]:opacity-55"
                  >
                    <h3 className="flex items-baseline gap-3 text-xl font-extrabold uppercase" style={{ fontStretch: "118%" }}>
                      <span className="font-mono-l text-xs font-medium text-[var(--l-orange)] tabular-nums">
                        0{i + 1}
                      </span>
                      {s.title}
                    </h3>
                    <p className="body-l mt-1 max-w-sm text-sm text-white/70 group-data-[active=false]:hidden sm:group-data-[active=false]:block">
                      {s.body}
                    </p>
                  </li>
                ))}
              </ol>
            </div>
          </div>

          <IsoScene mode="story" className="mx-auto w-full max-w-[40rem]" />
        </div>
      </div>
    </section>
  )
}
