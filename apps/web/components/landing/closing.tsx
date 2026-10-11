import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { LogoMark } from "@/components/logo"
import { Reveal } from "@/components/landing/reveal"
import { Terminal3D } from "@/components/landing/terminal-3d"

export function LogsSection() {
  return (
    <section id="logs" className="overflow-hidden px-5 py-24 sm:px-8 sm:py-32">
      <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
        <Reveal>
          <h2 className="display display-lg">
            Every line,
            <br />
            as it happens.
          </h2>
          <p className="body-l mt-5 max-w-sm text-lg">
            Build logs stream to your browser while the build runs, and stay on
            the deployment afterwards. Follow, wrap, copy.
          </p>
        </Reveal>
        <Terminal3D />
      </div>
    </section>
  )
}

export function Closing() {
  return (
    <>
      <section className="bg-[var(--l-orange)] px-5 py-24 sm:px-8 sm:py-36">
        <Reveal className="mx-auto max-w-7xl">
          <h2 className="display text-[clamp(2.6rem,10vw,6rem)]">
            Ship the
            <br />
            next one.
          </h2>
          <div className="mt-10 flex flex-wrap items-center gap-3">
            <Link href="/dashboard" className="btn-l btn-ink">
              Open the dashboard <ArrowRight aria-hidden className="size-4" />
            </Link>
            <Link href="/projects/new" className="btn-l btn-outline">
              Deploy a repo
            </Link>
          </div>
        </Reveal>
      </section>

      <footer className="bg-[var(--l-ink)] px-5 py-8 text-[var(--l-concrete)] sm:px-8">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 text-sm">
          <div className="flex items-center gap-2">
            <LogoMark className="size-6" />
            <span className="font-extrabold uppercase" style={{ fontStretch: "112%" }}>
              Dev Hoster
            </span>
          </div>
          <nav aria-label="Footer" className="flex flex-wrap gap-x-5 gap-y-2 text-white/70">
            <Link href="/dashboard" className="hover:text-white">Dashboard</Link>
            <Link href="/projects" className="hover:text-white">Projects</Link>
            <Link href="/login" className="hover:text-white">Sign in</Link>
          </nav>
        </div>
      </footer>
    </>
  )
}
