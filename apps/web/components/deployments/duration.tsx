"use client"

import { formatDuration } from "@/lib/format"
import { useNow } from "@/lib/hooks/use-now"

/** Ticks every second while a build is still running. */
export function Duration({
  start,
  end,
}: {
  start: string | null
  end: string | null
}) {
  const now = useNow(end ? 60_000 : 1_000)
  return (
    <span className="tabular-nums">{formatDuration(start, end, now)}</span>
  )
}
