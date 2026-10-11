import type { Metadata } from "next"
import { GeneralSettings } from "@/components/projects/general-settings"

export const metadata: Metadata = { title: "Project settings" }

export default async function ProjectSettingsPage({
  params,
}: PageProps<"/projects/[slug]/settings">) {
  const { slug } = await params
  return <GeneralSettings slug={slug} />
}
