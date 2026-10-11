import type { Metadata } from "next"
import { DomainsManager } from "@/components/projects/domains-manager"

export const metadata: Metadata = { title: "Domains" }

export default async function DomainsPage({
  params,
}: PageProps<"/projects/[slug]/settings/domains">) {
  const { slug } = await params
  return <DomainsManager slug={slug} />
}
