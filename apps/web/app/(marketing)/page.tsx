import type { Metadata } from "next"
import { Features } from "@/components/landing/features"
import { Closing, LogsSection } from "@/components/landing/closing"
import { Hero } from "@/components/landing/hero"
import { PillNav } from "@/components/landing/pill-nav"
import { PipelineStory } from "@/components/landing/pipeline-story"

export const metadata: Metadata = {
  title: { absolute: "Dev Hoster — paste a repo, get a URL" },
  description:
    "Dev Hoster clones your Git repo, builds it in a container and serves it on its own subdomain.",
}

export default function LandingPage() {
  return (
    <>
      <PillNav />
      <main>
        <Hero />
        <PipelineStory />
        <LogsSection />
        <Features />
        <Closing />
      </main>
    </>
  )
}
