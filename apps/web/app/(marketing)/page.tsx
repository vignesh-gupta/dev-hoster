import type { Metadata } from "next"
import { Features } from "@/components/landing/features"
import { Closing, LogsSection } from "@/components/landing/closing"
import { Hero } from "@/components/landing/hero"
import { LandingNav } from "@/components/landing/pill-nav"
import { PipelineStory } from "@/components/landing/pipeline-story"

export const metadata: Metadata = {
  authors: [{ name: "Vignesh Gupta" }],
  title: { absolute: "Dev Hoster — push to Git, we host it" },
  description:
    "Connect your Git repository and Dev Hoster builds, deploys and hosts it for you. Next.js and static sites, live on every push.",
}

export default function LandingPage() {
  return (
    <>
      <LandingNav />
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
