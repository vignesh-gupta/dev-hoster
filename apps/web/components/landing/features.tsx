"use client"

import { Check, Clock, Lock } from "lucide-react"
import { usePointerTilt } from "@/components/landing/hooks"
import { Reveal } from "@/components/landing/reveal"

function Tile({
  className,
  dark,
  children,
}: {
  className?: string
  dark?: boolean
  children: React.ReactNode
}) {
  const ref = usePointerTilt<HTMLDivElement>()
  return (
    <div
      ref={ref}
      className={
        "tilt flex h-full flex-col gap-5 p-6 " +
        (dark
          ? "bg-[var(--l-ink)] text-[var(--l-concrete)] "
          : "bg-white text-[var(--l-ink)] shadow-[inset_0_0_0_2px_var(--l-ink)] ") +
        (className ?? "")
      }
    >
      {children}
    </div>
  )
}

const h3 = "text-2xl leading-[0.95] font-black uppercase"

export function Features() {
  return (
    <section
      id="features"
      className="bg-[var(--l-concrete)] px-5 py-24 sm:px-8 sm:py-32"
    >
      <div className="mx-auto max-w-7xl">
        <Reveal>
          <h2 className="display display-lg max-w-3xl">
            Everything hosting needs.{" "}
            <span className="text-[var(--l-orange-deep)]">Nothing to set up.</span>
          </h2>
        </Reveal>

        <div className="mt-12 grid gap-4 md:grid-cols-12">
          <Reveal className="md:col-span-7" delay={0}>
            <Tile className="rollback">
              <div className="relative h-32">
                {[
                  ["d814c1", "chore: bump dependencies", "Live"],
                  ["2abb0f", "fix: mobile nav overflow", "Ready"],
                  ["af658d", "feat: add projects grid", "Ready"],
                ].map(([slug, msg, tag], i) => (
                  <div
                    key={slug}
                    className="stack-card font-mono-l absolute inset-x-0 top-0 flex items-center justify-between gap-3 border-2 border-[var(--l-ink)] bg-white px-3 py-2 text-xs"
                    style={{ "--k": 2 - i, zIndex: 3 - i } as React.CSSProperties}
                  >
                    <span className="font-bold">{slug}</span>
                    <span className="truncate text-black/60">{msg}</span>
                    <span
                      className={
                        "shrink-0 px-1.5 py-0.5 text-[10px] font-extrabold uppercase " +
                        (tag === "Live"
                          ? "bg-[var(--l-orange)] text-[var(--l-ink)]"
                          : "bg-black/8 text-black/70")
                      }
                    >
                      {tag}
                    </span>
                  </div>
                ))}
              </div>
              <div>
                <h3 className={h3} style={{ fontStretch: "118%" }}>
                  Roll back in one click
                </h3>
                <p className="body-l mt-2 max-w-md text-sm text-black/70">
                  Every build is kept. Promote any past deployment and the URL
                  switches to it immediately.
                </p>
              </div>
            </Tile>
          </Reveal>

          <Reveal className="md:col-span-5" delay={80}>
            <Tile>
              <div className="font-mono-l space-y-1.5 text-xs">
                {[
                  ["API_URL", "https://api.example.com", false],
                  ["ANALYTICS_KEY", "••••••••", true],
                  ["FEATURE_FLAGS", "beta,blog", false],
                ].map(([k, v, secret]) => (
                  <div key={String(k)} className="flex items-center gap-2 border-2 border-[var(--l-ink)] px-2.5 py-1.5">
                    <span className="font-bold">{k}</span>
                    <span className="ml-auto truncate text-black/60">{v}</span>
                    {secret && <Lock className="size-3 shrink-0" aria-label="Secret" />}
                  </div>
                ))}
              </div>
              <div>
                <h3 className={h3} style={{ fontStretch: "118%" }}>
                  Secrets stay secret
                </h3>
                <p className="body-l mt-2 text-sm text-black/70">
                  Set variables per project. Mark one secret and its value is
                  never shown again.
                </p>
              </div>
            </Tile>
          </Reveal>

          <Reveal className="md:col-span-5" delay={0}>
            <Tile>
              <div className="font-mono-l space-y-1.5 text-xs">
                <div className="flex items-center gap-2 bg-[var(--l-ink)] px-2.5 py-1.5 text-[var(--l-concrete)]">
                  portfolio.example.com
                  <span className="ml-auto inline-flex items-center gap-1 text-[var(--l-green)]">
                    <Check className="size-3" /> Verified
                  </span>
                </div>
                <div className="flex items-center gap-2 border-2 border-dashed border-[var(--l-ink)] px-2.5 py-1.5">
                  docs.example.com
                  <span className="ml-auto inline-flex items-center gap-1 text-black/60">
                    <Clock className="size-3" /> Pending
                  </span>
                </div>
              </div>
              <div>
                <h3 className={h3} style={{ fontStretch: "118%" }}>
                  Bring your domain
                </h3>
                <p className="body-l mt-2 text-sm text-black/70">
                  Every project gets a subdomain. Add your own with a single
                  CNAME record.
                </p>
              </div>
            </Tile>
          </Reveal>

          <Reveal className="md:col-span-7" delay={80}>
            <Tile dark>
              <div className="font-mono-l space-y-1.5 text-xs">
                {[
                  ["d814c1", "chore: bump dependencies", "Live", "text-[var(--l-green)]"],
                  ["913b3f", "wip: blog index", "Build failed", "text-[var(--l-red)]"],
                  ["2abb0f", "fix: mobile nav overflow", "Ready", "text-white/60"],
                ].map(([slug, msg, status, tone]) => (
                  <div key={slug} className="flex items-center gap-3 border border-white/20 px-3 py-2">
                    <span className="font-bold">{slug}</span>
                    <span className="truncate text-white/60">{msg}</span>
                    <span className={"ml-auto shrink-0 font-bold " + tone}>{status}</span>
                  </div>
                ))}
              </div>
              <div>
                <h3 className={h3} style={{ fontStretch: "118%" }}>
                  Every push, deployed
                </h3>
                <p className="body-l mt-2 max-w-md text-sm text-white/70">
                  Push to your branch and a new version goes up on its own. If a
                  build fails, your live site keeps running untouched.
                </p>
              </div>
            </Tile>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
