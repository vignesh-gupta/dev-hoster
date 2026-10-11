import type { Metadata } from "next"
import { DeploymentsView } from "@/components/deployments/deployments-view"
import { PageHeader } from "@/components/page-header"

export const metadata: Metadata = { title: "Deployments" }

export default function DeploymentsPage() {
  return (
    <>
      <PageHeader
        title="Deployments"
        description="Every build across all projects, newest first."
      />
      <DeploymentsView />
    </>
  )
}
