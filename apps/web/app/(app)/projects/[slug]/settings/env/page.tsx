import type { Metadata } from "next"
import { EnvEditor } from "@/components/projects/env-editor"

export const metadata: Metadata = { title: "Environment variables" }

export default async function EnvPage({
  params,
}: PageProps<"/projects/[slug]/settings/env">) {
  const { slug } = await params
  return <EnvEditor slug={slug} />
}
