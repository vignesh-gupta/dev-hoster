"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@dev-hoster/ui/components/alert-dialog"
import { Button } from "@dev-hoster/ui/components/button"
import { Input } from "@dev-hoster/ui/components/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@dev-hoster/ui/components/select"
import { Skeleton } from "@dev-hoster/ui/components/skeleton"
import { toast } from "sonner"
import { useDeleteProject, useProject, useUpdateProject } from "@/lib/api/hooks"
import { validate, type FieldErrors } from "@/lib/form"
import { updateProjectSchema } from "@/lib/schemas"
import { FRAMEWORKS, type Framework, type ProjectWithActive } from "@/lib/types"
import { Field } from "@/components/field"
import { FRAMEWORK_LABEL } from "@/components/projects/project-shell"
import { Section } from "@/components/section"

type Draft = Pick<
  ProjectWithActive,
  "name" | "repoUrl" | "branch" | "framework" | "installCommand" | "buildCommand" | "outputDir"
>

const pick = (p: ProjectWithActive): Draft => ({
  name: p.name,
  repoUrl: p.repoUrl,
  branch: p.branch,
  framework: p.framework,
  installCommand: p.installCommand,
  buildCommand: p.buildCommand,
  outputDir: p.outputDir,
})

export function GeneralSettings({ slug }: { slug: string }) {
  const { data: project } = useProject(slug)
  const update = useUpdateProject(slug)
  const [draft, setDraft] = useState<Draft | null>(null)
  const [errors, setErrors] = useState<FieldErrors>({})

  // Seed the form once the project loads (and re-seed after a save).
  useEffect(() => {
    if (project) setDraft(pick(project))
  }, [project])

  if (!project || !draft)
    return <Skeleton className="h-96 w-full" />

  const saved = pick(project)
  const dirty = (Object.keys(saved) as (keyof Draft)[]).some(
    (k) => saved[k] !== draft[k]
  )
  const set = <K extends keyof Draft>(key: K, value: Draft[K]) =>
    setDraft((d) => d && { ...d, [key]: value })

  function submit(e: React.FormEvent) {
    e.preventDefault()
    const result = validate(updateProjectSchema, draft)
    if (result.errors) {
      setErrors(result.errors)
      requestAnimationFrame(() =>
        document.querySelector<HTMLElement>("[aria-invalid=true]")?.focus()
      )
      return
    }
    setErrors({})
    update.mutate(result.data, {
      onSuccess: () => toast.success("Settings saved"),
      onError: (err) => toast.error(err.message),
    })
  }

  return (
    <>
      <form onSubmit={submit} noValidate>
        <Section
          title="General"
          description="Changes apply to the next deployment."
          actions={
            <Button type="submit" size="sm" disabled={!dirty || update.isPending}>
              {update.isPending ? "Saving…" : "Save changes"}
            </Button>
          }
        >
          <div className="space-y-4 p-3">
            <Field label="Project name" error={errors.name}>
              {(p) => (
                <Input
                  {...p}
                  value={draft.name}
                  onChange={(e) => set("name", e.target.value)}
                />
              )}
            </Field>
            <Field
              label="Repository URL"
              error={errors.repoUrl}
              hint="The live URL stays the same when you change this."
            >
              {(p) => (
                <Input
                  {...p}
                  value={draft.repoUrl}
                  onChange={(e) => set("repoUrl", e.target.value)}
                  className="font-mono"
                  spellCheck={false}
                />
              )}
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Production branch" error={errors.branch}>
                {(p) => (
                  <Input
                    {...p}
                    value={draft.branch}
                    onChange={(e) => set("branch", e.target.value)}
                    className="font-mono"
                  />
                )}
              </Field>
              <Field label="Framework">
                {(p) => (
                  <Select
                    value={draft.framework}
                    onValueChange={(v) => v && set("framework", v as Framework)}
                  >
                    <SelectTrigger id={p.id} className="w-full">
                      <SelectValue>
                        {(v: Framework) => FRAMEWORK_LABEL[v]}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {FRAMEWORKS.map((f) => (
                        <SelectItem key={f} value={f}>
                          {FRAMEWORK_LABEL[f]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </Field>
              <Field label="Install command" error={errors.installCommand}>
                {(p) => (
                  <Input
                    {...p}
                    value={draft.installCommand}
                    onChange={(e) => set("installCommand", e.target.value)}
                    className="font-mono"
                  />
                )}
              </Field>
              <Field label="Build command" error={errors.buildCommand}>
                {(p) => (
                  <Input
                    {...p}
                    value={draft.buildCommand}
                    onChange={(e) => set("buildCommand", e.target.value)}
                    className="font-mono"
                  />
                )}
              </Field>
            </div>
            <Field
              label="Output directory"
              error={errors.outputDir}
              hint="Folder the build writes to, relative to the repo root."
            >
              {(p) => (
                <Input
                  {...p}
                  value={draft.outputDir}
                  onChange={(e) => set("outputDir", e.target.value)}
                  className="font-mono"
                />
              )}
            </Field>
          </div>
        </Section>
      </form>

      <DangerZone slug={slug} name={project.name} />
    </>
  )
}

function DangerZone({ slug, name }: { slug: string; name: string }) {
  const router = useRouter()
  const remove = useDeleteProject(slug)
  const [confirm, setConfirm] = useState("")
  const [open, setOpen] = useState(false)

  return (
    <section className="border border-destructive/40 bg-card">
      <div className="flex flex-wrap items-center justify-between gap-3 p-3">
        <div className="space-y-0.5">
          <h2 className="text-xs font-semibold text-destructive">
            Delete this project
          </h2>
          <p className="max-w-prose text-xs/relaxed text-muted-foreground">
            Removes the project, its deployments, logs, environment variables
            and domains. The live site goes offline. This cannot be undone.
          </p>
        </div>
        <AlertDialog
          open={open}
          onOpenChange={(o) => {
            setOpen(o)
            if (!o) setConfirm("")
          }}
        >
          <AlertDialogTrigger
            render={<Button variant="destructive">Delete project</Button>}
          />
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete {name}?</AlertDialogTitle>
              <AlertDialogDescription>
                Type <span className="font-mono font-medium text-foreground">{slug}</span> to
                confirm.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <Input
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              aria-label="Type the project slug to confirm"
              autoComplete="off"
              spellCheck={false}
              className="font-mono"
            />
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <Button
                variant="destructive"
                disabled={confirm !== slug || remove.isPending}
                onClick={() =>
                  remove.mutate(undefined, {
                    onSuccess: () => {
                      toast.success(`${name} deleted`)
                      router.replace("/projects")
                    },
                    onError: (e) => toast.error(e.message),
                  })
                }
              >
                {remove.isPending ? "Deleting…" : "Delete forever"}
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </section>
  )
}
