"use client"

import { useState } from "react"
import { Button } from "@dev-hoster/ui/components/button"
import { Checkbox } from "@dev-hoster/ui/components/checkbox"
import { Input } from "@dev-hoster/ui/components/input"
import { Skeleton } from "@dev-hoster/ui/components/skeleton"
import { Badge } from "@dev-hoster/ui/components/badge"
import { KeyRound, Pencil, Plus, Trash2, X, Check } from "lucide-react"
import { toast } from "sonner"
import {
  useCreateEnvVar,
  useDeleteEnvVar,
  useEnvVars,
  useUpdateEnvVar,
} from "@/lib/api/hooks"
import { validate, type FieldErrors } from "@/lib/form"
import { envVarInputSchema } from "@/lib/schemas"
import type { EnvVar } from "@/lib/types"
import { EmptyState } from "@/components/empty-state"
import { ErrorState } from "@/components/error-state"
import { Field } from "@/components/field"
import { Section } from "@/components/section"

export function EnvEditor({ slug }: { slug: string }) {
  const query = useEnvVars(slug)

  return (
    <>
      <AddEnvVar slug={slug} />
      <Section
        title="Variables"
        description="Passed to the build. Changes apply to the next deployment."
      >
        {query.isError ? (
          <ErrorState error={query.error} onRetry={() => query.refetch()} />
        ) : query.isPending ? (
          <div className="space-y-px p-3">
            <Skeleton className="h-8" />
            <Skeleton className="h-8" />
          </div>
        ) : query.data.length === 0 ? (
          <EmptyState
            className="m-3"
            icon={KeyRound}
            title="No variables yet"
            description="Add API URLs, public keys or feature flags your build needs. Mark anything sensitive as secret."
          />
        ) : (
          <ul className="divide-y">
            {query.data.map((env) => (
              <EnvRow key={env.id} slug={slug} env={env} />
            ))}
          </ul>
        )}
      </Section>
    </>
  )
}

function AddEnvVar({ slug }: { slug: string }) {
  const create = useCreateEnvVar(slug)
  const [key, setKey] = useState("")
  const [value, setValue] = useState("")
  const [secret, setSecret] = useState(false)
  const [errors, setErrors] = useState<FieldErrors>({})

  function submit(e: React.FormEvent) {
    e.preventDefault()
    const result = validate(envVarInputSchema, { key, value, secret })
    if (result.errors) {
      setErrors(result.errors)
      return
    }
    setErrors({})
    create.mutate(result.data, {
      onSuccess: () => {
        setKey("")
        setValue("")
        setSecret(false)
        toast.success(`${result.data.key} added`)
      },
      onError: (err) => setErrors({ key: err.message }),
    })
  }

  return (
    <Section title="Add a variable">
      <form
        onSubmit={submit}
        noValidate
        className="grid gap-3 p-3 sm:grid-cols-[1fr_1.4fr_auto_auto] sm:items-start"
      >
        <Field label="Key" error={errors.key}>
          {(p) => (
            <Input
              {...p}
              placeholder="API_URL"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              className="font-mono"
              autoComplete="off"
              spellCheck={false}
            />
          )}
        </Field>
        <Field label="Value" error={errors.value}>
          {(p) => (
            <Input
              {...p}
              placeholder="https://api.example.com"
              type={secret ? "password" : "text"}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="font-mono"
              autoComplete="off"
            />
          )}
        </Field>
        <label className="flex h-8 items-center gap-1.5 text-xs text-muted-foreground sm:mt-5.5">
          <Checkbox checked={secret} onCheckedChange={(c) => setSecret(!!c)} />
          Secret
        </label>
        <Button
          type="submit"
          disabled={create.isPending}
          className="sm:mt-5.5"
        >
          <Plus /> Add
        </Button>
      </form>
    </Section>
  )
}

function EnvRow({ slug, env }: { slug: string; env: EnvVar }) {
  const update = useUpdateEnvVar(slug)
  const remove = useDeleteEnvVar(slug)
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState(env.secret ? "" : env.value)
  const [confirmDelete, setConfirmDelete] = useState(false)

  if (editing) {
    return (
      <li className="flex flex-wrap items-center gap-2 px-3 py-2">
        <span className="w-40 shrink-0 truncate font-mono text-xs font-medium">
          {env.key}
        </span>
        <Input
          aria-label={`Value for ${env.key}`}
          autoFocus
          type={env.secret ? "password" : "text"}
          placeholder={env.secret ? "Leave blank to keep the current value" : ""}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="min-w-48 flex-1 font-mono"
        />
        <Button
          size="icon"
          aria-label="Save"
          disabled={update.isPending || (env.secret && value === "")}
          onClick={() =>
            update.mutate(
              { id: env.id, value },
              {
                onSuccess: () => {
                  setEditing(false)
                  toast.success(`${env.key} updated`)
                },
                onError: (e) => toast.error(e.message),
              }
            )
          }
        >
          <Check />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          aria-label="Cancel"
          onClick={() => {
            setEditing(false)
            setValue(env.secret ? "" : env.value)
          }}
        >
          <X />
        </Button>
      </li>
    )
  }

  return (
    <li className="flex items-center gap-3 px-3 py-2">
      <span className="w-40 shrink-0 truncate font-mono text-xs font-medium">
        {env.key}
      </span>
      <span className="min-w-0 flex-1 truncate font-mono text-xs text-muted-foreground">
        {env.value}
      </span>
      {env.secret && <Badge variant="outline">Secret</Badge>}
      {confirmDelete ? (
        <div className="flex items-center gap-1">
          <span className="text-xs text-muted-foreground">Delete?</span>
          <Button
            size="xs"
            variant="destructive"
            disabled={remove.isPending}
            onClick={() =>
              remove.mutate(env.id, {
                onSuccess: () => toast(`${env.key} deleted`),
                onError: (e) => toast.error(e.message),
              })
            }
          >
            Delete
          </Button>
          <Button size="xs" variant="ghost" onClick={() => setConfirmDelete(false)}>
            Keep
          </Button>
        </div>
      ) : (
        <div className="flex items-center">
          <Button
            size="icon-sm"
            variant="ghost"
            aria-label={`Edit ${env.key}`}
            onClick={() => setEditing(true)}
          >
            <Pencil />
          </Button>
          <Button
            size="icon-sm"
            variant="ghost"
            aria-label={`Delete ${env.key}`}
            onClick={() => setConfirmDelete(true)}
          >
            <Trash2 />
          </Button>
        </div>
      )}
    </li>
  )
}
