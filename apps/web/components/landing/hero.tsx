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
            Hosting for Next.js and static sites
          </p>
          <h1 className="display display-xl">
            Just push.
            <br />
            <span className="mt-2 inline-block bg-[var(--l-ink)] px-3 pt-1 pb-2 text-[var(--l-orange)]">
              We host it.
            </span>
          </h1>
          <p className="body-l mt-6 max-w-md text-lg">
            Connect your Git repository once. From then on, every push is built,
            deployed and live at its own address. You write the code, we handle
            the rest.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link href="/projects/new" className="btn-l btn-ink">
              Connect a repo <ArrowRight aria-hidden className="size-4" />
            </Link>
            <a href="#pipeline" className="btn-l btn-outline">
              See how it works <ArrowDown aria-hidden className="size-4" />
            </a>
          </div>
          <p className="font-mono-l mt-8 text-xs font-medium opacity-80">
            Next.js · React · Vue · Svelte · static sites
          </p>
        </div>

        <IsoScene mode="hero" className="relative z-0 -mt-6 lg:mt-0" />
      </div>
    </section>
  )
}
