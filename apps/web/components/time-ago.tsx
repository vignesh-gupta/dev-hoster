"use client"

import { formatDateTime, timeAgo } from "@/lib/format"
import { useNow } from "@/lib/hooks/use-now"

export function TimeAgo({ iso }: { iso: string | null | undefined }) {
  const now = useNow()
  if (!iso) return <span className="text-muted-foreground">—</span>
  return (
    <time
      dateTime={iso}
      title={formatDateTime(iso)}
      className="whitespace-nowrap"
    >
      {timeAgo(iso, now)}
    </time>
  )
}
