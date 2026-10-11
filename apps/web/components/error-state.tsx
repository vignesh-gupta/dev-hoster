"use client"

import { Button } from "@dev-hoster/ui/components/button"
import { SearchX, TriangleAlert } from "lucide-react"
import { ApiError } from "@/lib/api/client"
import { EmptyState } from "@/components/empty-state"
import { LinkButton } from "@/components/link-button"

export function ErrorState({
  error,
  onRetry,
  notFoundTitle = "Not found",
  backHref,
  backLabel = "Go back",
}: {
  error: unknown
  onRetry?: () => void
  notFoundTitle?: string
  backHref?: string
  backLabel?: string
}) {
  if (error instanceof ApiError && error.status === 404) {
    return (
      <EmptyState
        icon={SearchX}
        title={notFoundTitle}
        description={error.message}
      >
        {backHref && (
          <LinkButton variant="outline" href={backHref}>
            {backLabel}
          </LinkButton>
        )}
      </EmptyState>
    )
  }
  return (
    <EmptyState
      icon={TriangleAlert}
      title="Could not load this"
      description={error instanceof Error ? error.message : "Unexpected error"}
    >
      {onRetry && (
        <Button variant="outline" onClick={onRetry}>
          Try again
        </Button>
      )}
    </EmptyState>
  )
}
