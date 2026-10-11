import type { Metadata } from "next"
import { NewProjectForm } from "@/components/projects/new-project-form"
import { PageHeader } from "@/components/page-header"

export const metadata: Metadata = { title: "New project" }

export default function NewProjectPage() {
  return (
    <>
      <PageHeader
        title="New project"
        description="Paste a repository. The first build starts as soon as you create it."
      />
      <NewProjectForm />
    </>
  )
}
