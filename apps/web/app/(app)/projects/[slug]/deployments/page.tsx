import type { Metadata } from "next"
import { DeploymentsView } from "@/components/deployments/deployments-view"

export const metadata: Metadata = { title: "Deployments" }

export default async function ProjectDeploymentsPage({
  params,
}: PageProps<"/projects/[slug]/deployments">) {
  const { slug } = await params
  return <DeploymentsView slug={slug} />
}
