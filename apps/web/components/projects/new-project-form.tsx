"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { Button } from "@dev-hoster/ui/components/button"
import { Checkbox } from "@dev-hoster/ui/components/checkbox"
import { Input } from "@dev-hoster/ui/components/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@dev-hoster/ui/components/select"
import { ChevronRight, Plus, X } from "lucide-react"
import { toast } from "sonner"
import { useCreateProject } from "@/lib/api/hooks"
import { validate, type FieldErrors } from "@/lib/form"
import { createProjectSchema, defaultOutputDir } from "@/lib/schemas"
import { projectNameFromRepoUrl } from "@/lib/slug"
import { FRAMEWORKS, type Framework } from "@/lib/types"
import { Field } from "@/components/field"
import { FRAMEWORK_LABEL } from "@/components/projects/project-shell"
import { Section } from "@/components/section"

interface EnvRow {
  key: string
  value: string
  secret: boolean
}

const STEPS = [
  ["Clone", "We pull your repo at the branch you choose."],
  ["Build", "Install and build run in an isolated container."],
  ["Publish", "The build output is stored and versioned."],
  ["Go live", "Your project gets a URL as soon as the build succeeds."],
]

export function NewProjectForm() {
  const router = useRouter()
  const create = useCreateProject()
  const [repoUrl, setRepoUrl] = useState("")
  const [name, setName] = useState("")
  const [branch, setBranch] = useState("main")
  const [framework, setFramework] = useState<Framework>("REACT")
  const [installCommand, setInstallCommand] = useState("npm install")
  const [buildCommand, setBuildCommand] = useState("npm run build")
  const [outputDir, setOutputDir] = useState("")
  const [env, setEnv] = useState<EnvRow[]>([])
  const [showBuild, setShowBuild] = useState(false)
  const [showEnv, setShowEnv] = useState(false)
  const [errors, setErrors] = useState<FieldErrors>({})

  const derivedName = /github\.com\/[\w.-]+\/[\w.-]+/.test(repoUrl)
    ? projectNameFromRepoUrl(repoUrl.trim())
    : ""

  function submit(e: React.FormEvent) {
    e.preventDefault()
    const result = validate(createProjectSchema, {
      repoUrl,
      name: name.trim() || undefined,
      branch,
      framework,
      installCommand,
      buildCommand,
      outputDir: outputDir.trim() || undefined,
      envVars: env.filter((r) => r.key.trim() || r.value),
    })
    if (result.errors) {
      setErrors(result.errors)
      // Reveal collapsed sections that hold an error, then focus the first invalid field.
      if (Object.keys(result.errors).some((k) => k.startsWith("envVars"))) setShowEnv(true)
      if (/installCommand|buildCommand|outputDir/.test(Object.keys(result.errors).join())) setShowBuild(true)
      requestAnimationFrame(() =>
        document.querySelector<HTMLElement>("[aria-invalid=true]")?.focus()
      )
      return
    }
    setErrors({})
    create.mutate(result.data, {
      onSuccess: ({ project, deployment }) => {
        toast.success(`${project.name} created`, {
          description: "First build queued.",
        })
        router.push(`/projects/${project.slug}/deployments/${deployment.slug}`)
      },
      onError: (err) => toast.error(err.message),
    })
  }

  const updateEnv = (i: number, patch: Partial<EnvRow>) =>
    setEnv((rows) => rows.map((r, j) => (j === i ? { ...r, ...patch } : r)))

  return (
    <form
      onSubmit={submit}
      noValidate
      className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_16rem]"
    >
      <div className="min-w-0 space-y-5">
        <Section title="Repository">
          <div className="space-y-4 p-3">
            <Field
              label="GitHub repository URL"
              required
              error={errors.repoUrl}
              hint="Public repos only for now."
            >
              {(p) => (
                <Input
                  {...p}
                  autoFocus
                  autoComplete="off"
                  spellCheck={false}
                  placeholder="https://github.com/user/repo"
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  className="font-mono"
                />
              )}
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Project name" error={errors.name} hint="Used for the URL.">
                {(p) => (
                  <Input
                    {...p}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={derivedName || "my-app"}
                  />
                )}
              </Field>
              <Field label="Branch" error={errors.branch}>
                {(p) => (
                  <Input
                    {...p}
                    value={branch}
                    onChange={(e) => setBranch(e.target.value)}
                    className="font-mono"
                  />
                )}
              </Field>
            </div>
            <Field label="Framework">
              {(p) => (
                <Select
                  value={framework}
                  onValueChange={(v) => v && setFramework(v as Framework)}
                >
                  <SelectTrigger id={p.id} className="w-full sm:w-56">
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
          </div>
        </Section>

        <Disclosure
          open={showBuild}
          onToggle={() => setShowBuild((v) => !v)}
          title="Build settings"
          summary={`${installCommand} → ${buildCommand}`}
        >
          <div className="grid gap-4 p-3 sm:grid-cols-2">
            <Field label="Install command" error={errors.installCommand}>
              {(p) => (
                <Input
                  {...p}
                  value={installCommand}
                  onChange={(e) => setInstallCommand(e.target.value)}
                  className="font-mono"
                />
              )}
            </Field>
            <Field label="Build command" error={errors.buildCommand}>
              {(p) => (
                <Input
                  {...p}
                  value={buildCommand}
                  onChange={(e) => setBuildCommand(e.target.value)}
                  className="font-mono"
                />
              )}
            </Field>
            <Field
              label="Output directory"
              error={errors.outputDir}
              hint="Folder the build writes to. Leave empty for the framework default."
              className="sm:col-span-2"
            >
              {(p) => (
                <Input
                  {...p}
                  value={outputDir}
                  placeholder={defaultOutputDir(framework)}
                  onChange={(e) => setOutputDir(e.target.value)}
                  className="font-mono"
                />
              )}
            </Field>
          </div>
        </Disclosure>

        <Disclosure
          open={showEnv}
          onToggle={() => setShowEnv((v) => !v)}
          title="Environment variables"
          summary={env.length ? `${env.length} set` : "None"}
        >
          <div className="space-y-2 p-3">
            {env.map((row, i) => (
              <div key={i} className="grid grid-cols-[1fr_1fr_auto_auto] items-start gap-2">
                <Field label="Key" className="[&>label]:sr-only" error={errors[`envVars.${i}.key`]}>
                  {(p) => (
                    <Input
                      {...p}
                      placeholder="KEY"
                      value={row.key}
                      onChange={(e) => updateEnv(i, { key: e.target.value })}
                      className="font-mono"
                    />
                  )}
                </Field>
                <Field label="Value" className="[&>label]:sr-only">
                  {(p) => (
                    <Input
                      {...p}
                      placeholder="value"
                      type={row.secret ? "password" : "text"}
                      value={row.value}
                      onChange={(e) => updateEnv(i, { value: e.target.value })}
                      className="font-mono"
                    />
                  )}
                </Field>
                <label className="flex h-8 items-center gap-1.5 text-xs text-muted-foreground">
                  <Checkbox
                    checked={row.secret}
                    onCheckedChange={(c) => updateEnv(i, { secret: !!c })}
                  />
                  Secret
                </label>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label={`Remove variable ${row.key || i + 1}`}
                  onClick={() => setEnv((rows) => rows.filter((_, j) => j !== i))}
                >
                  <X />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setEnv((rows) => [...rows, { key: "", value: "", secret: false }])}
            >
              <Plus /> Add variable
            </Button>
          </div>
        </Disclosure>

        <div className="flex items-center gap-2">
          <Button type="submit" disabled={create.isPending}>
            {create.isPending ? "Creating…" : "Create and deploy"}
          </Button>
          <Button type="button" variant="ghost" onClick={() => router.back()}>
            Cancel
          </Button>
        </div>
      </div>

      <aside aria-label="What happens next" className="space-y-3 lg:pt-0">
        <h2 className="text-xs font-semibold">What happens next</h2>
        <ol className="space-y-3 border-l pl-4">
          {STEPS.map(([title, text], i) => (
            <li key={title} className="relative">
              <span
                aria-hidden
                className="absolute top-0 -left-[calc(1rem+9px)] flex size-[17px] items-center justify-center bg-primary text-[10px] font-semibold text-primary-foreground"
              >
                {i + 1}
              </span>
              <p className="text-xs font-medium">{title}</p>
              <p className="text-[11px]/relaxed text-muted-foreground">{text}</p>
            </li>
          ))}
        </ol>
      </aside>
    </form>
  )
}

function Disclosure({
  open,
  onToggle,
  title,
  summary,
  children,
}: {
  open: boolean
  onToggle: () => void
  title: string
  summary: string
  children: React.ReactNode
}) {
  return (
    <section className="border bg-card">
      <button
        type="button"
        aria-expanded={open}
        onClick={onToggle}
        className="flex w-full items-center gap-2 px-3 py-2 text-left outline-none focus-visible:bg-muted"
      >
        <ChevronRight
          aria-hidden
          className="size-3.5 text-muted-foreground transition-transform duration-150 ease-out aria-expanded:rotate-90"
          style={{ rotate: open ? "90deg" : undefined }}
        />
        <span className="text-xs font-semibold">{title}</span>
        <span className="ml-auto truncate font-mono text-[11px] text-muted-foreground">
          {summary}
        </span>
      </button>
      {open && <div className="border-t">{children}</div>}
    </section>
  )
}
