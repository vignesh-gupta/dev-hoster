"use client"

import { useState } from "react"
import { Badge } from "@dev-hoster/ui/components/badge"
import { Button } from "@dev-hoster/ui/components/button"
import { Input } from "@dev-hoster/ui/components/input"
import { Skeleton } from "@dev-hoster/ui/components/skeleton"
import { CircleCheck, Clock, Globe, Plus, Trash2 } from "lucide-react"
import { toast } from "sonner"
import {
  useAddDomain,
  useDeleteDomain,
  useDomains,
  useVerifyDomain,
} from "@/lib/api/hooks"
import { validate, type FieldErrors } from "@/lib/form"
import { createDomainSchema } from "@/lib/schemas"
import type { Domain } from "@/lib/types"
import { CopyButton } from "@/components/copy-button"
import { EmptyState } from "@/components/empty-state"
import { ErrorState } from "@/components/error-state"
import { Field } from "@/components/field"
import { Section } from "@/components/section"

export function DomainsManager({ slug }: { slug: string }) {
  const query = useDomains(slug)

  if (query.isError)
    return <ErrorState error={query.error} onRetry={() => query.refetch()} />

  return (
    <>
      <Section title="Default domain" description="Always available.">
        <div className="flex items-center gap-2 px-3 py-2.5">
          <Globe aria-hidden className="size-3.5 text-muted-foreground" />
          {query.data ? (
            <>
              <span className="font-mono text-xs font-medium">
                {query.data.primary}
              </span>
              <CopyButton value={query.data.primary} label="Copy domain" />
            </>
          ) : (
            <Skeleton className="h-4 w-48" />
          )}
          <Badge variant="outline" className="ml-auto">
            Default
          </Badge>
        </div>
      </Section>

      <AddDomain slug={slug} />

      <Section title="Custom domains">
        {query.isPending ? (
          <Skeleton className="m-3 h-10" />
        ) : query.data.domains.length === 0 ? (
          <EmptyState
            className="m-3"
            icon={Globe}
            title="No custom domains"
            description="Point your own domain at this project. Add it above, then create the DNS record we show you."
          />
        ) : (
          <ul className="divide-y">
            {query.data.domains.map((d) => (
              <DomainRow
                key={d.id}
                slug={slug}
                domain={d}
                target={query.data.primary}
              />
            ))}
          </ul>
        )}
      </Section>
    </>
  )
}

function AddDomain({ slug }: { slug: string }) {
  const add = useAddDomain(slug)
  const [hostname, setHostname] = useState("")
  const [errors, setErrors] = useState<FieldErrors>({})

  function submit(e: React.FormEvent) {
    e.preventDefault()
    const result = validate(createDomainSchema, { hostname })
    if (result.errors) {
      setErrors(result.errors)
      return
    }
    setErrors({})
    add.mutate(result.data.hostname, {
      onSuccess: () => {
        setHostname("")
        toast.success(`${result.data.hostname} added`, {
          description: "Create the DNS record, then verify.",
        })
      },
      onError: (err) => setErrors({ hostname: err.message }),
    })
  }

  return (
    <Section title="Add a domain">
      <form
        onSubmit={submit}
        noValidate
        className="flex flex-col gap-3 p-3 sm:flex-row sm:items-start"
      >
        <Field
          label="Domain"
          className="flex-1"
          error={errors.hostname}
          hint="A hostname you control, for example app.example.com."
        >
          {(p) => (
            <Input
              {...p}
              placeholder="app.example.com"
              value={hostname}
              onChange={(e) => setHostname(e.target.value)}
              className="font-mono"
              autoComplete="off"
              spellCheck={false}
            />
          )}
        </Field>
        <Button type="submit" disabled={add.isPending} className="sm:mt-5.5">
          <Plus /> Add domain
        </Button>
      </form>
    </Section>
  )
}

function DomainRow({
  slug,
  domain,
  target,
}: {
  slug: string
  domain: Domain
  target: string
}) {
  const verify = useVerifyDomain(slug)
  const remove = useDeleteDomain(slug)
  const verified = domain.status === "VERIFIED"

  return (
    <li className="space-y-2 px-3 py-2.5">
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-mono text-xs font-medium">{domain.hostname}</span>
        {verified ? (
          <Badge className="border-transparent bg-success/12 text-success">
            <CircleCheck aria-hidden /> Verified
          </Badge>
        ) : (
          <Badge className="border-transparent bg-muted text-muted-foreground">
            <Clock aria-hidden /> Pending
          </Badge>
        )}
        <div className="ml-auto flex items-center gap-1">
          {!verified && (
            <Button
              size="sm"
              variant="outline"
              disabled={verify.isPending}
              onClick={() =>
                verify.mutate(domain.id, {
                  onSuccess: () => toast.success(`${domain.hostname} verified`),
                  onError: (e) => toast.error(e.message),
                })
              }
            >
              Verify
            </Button>
          )}
          <Button
            size="icon-sm"
            variant="ghost"
            aria-label={`Remove ${domain.hostname}`}
            disabled={remove.isPending}
            onClick={() =>
              remove.mutate(domain.id, {
                onSuccess: () => toast(`${domain.hostname} removed`),
                onError: (e) => toast.error(e.message),
              })
            }
          >
            <Trash2 />
          </Button>
        </div>
      </div>
      {!verified && (
        <p className="text-[11px]/relaxed text-muted-foreground">
          Add a <span className="font-mono">CNAME</span> record for{" "}
          <span className="font-mono">{domain.hostname}</span> pointing to{" "}
          <span className="font-mono">{target}</span>, then press Verify.
        </p>
      )}
    </li>
  )
}
