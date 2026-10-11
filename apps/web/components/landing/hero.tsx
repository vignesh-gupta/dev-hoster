import Link from "next/link"
import { ArrowDown, ArrowRight } from "lucide-react"
import { IsoScene } from "@/components/landing/iso-scene"

export function Hero() {
  return (
    <section className="relative isolate flex min-h-svh flex-col justify-center overflow-hidden px-5 pt-28 pb-16 sm:px-8">
      <div className="mx-auto grid w-full max-w-7xl items-center gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <div className="relative z-10">
          <p className="font-mono-l mb-5 inline-flex items-center gap-2 bg-[var(--l-ink)] px-2.5 py-1 text-xs font-medium text-[var(--l-concrete)]">
            <span aria-hidden className="size-1.5 animate-pulse rounded-full bg-[var(--l-orange)]" />
            git → build → s3 → live
          </p>
          <h1 className="display display-xl">
            Paste a repo.
            <br />
            <span className="mt-2 inline-block bg-[var(--l-ink)] px-3 pt-1 pb-2 text-[var(--l-orange)]">
              Get a URL.
            </span>
          </h1>
          <p className="body-l mt-6 max-w-md text-lg">
            Dev Hoster clones your Git repo, builds it in a container, and
            serves it on its own subdomain. No config files, no pipeline to
            wire up.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link href="/dashboard" className="btn-l btn-ink">
              Open the dashboard <ArrowRight aria-hidden className="size-4" />
            </Link>
            <a href="#pipeline" className="btn-l btn-outline">
              See how it ships <ArrowDown aria-hidden className="size-4" />
            </a>
          </div>
          <p className="font-mono-l mt-8 text-xs font-medium opacity-80">
            React · Vue · Svelte · static — anything that builds to dist/
          </p>
        </div>

        <IsoScene mode="hero" className="relative z-0 -mt-6 lg:mt-0" />
      </div>
    </section>
  )
}
