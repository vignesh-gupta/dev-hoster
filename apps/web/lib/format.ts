const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto", style: "short" })

const UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ["year", 31_536_000],
  ["month", 2_592_000],
  ["day", 86_400],
  ["hour", 3_600],
  ["minute", 60],
]

/** "just now", "5 min. ago", "yesterday", ... */
export function timeAgo(iso: string | null | undefined, now = Date.now()) {
  if (!iso) return "—"
  const seconds = Math.round((new Date(iso).getTime() - now) / 1000)
  if (Math.abs(seconds) < 45) return "just now"
  for (const [unit, size] of UNITS) {
    if (Math.abs(seconds) >= size)
      return rtf.format(Math.round(seconds / size), unit)
  }
  return rtf.format(Math.round(seconds / 60), "minute")
}

export function formatDateTime(iso: string | null | undefined) {
  if (!iso) return "—"
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  })
}

/** "48s", "1m 12s". Uses `now` while a build is still running. */
export function formatDuration(
  start: string | null | undefined,
  end: string | null | undefined,
  now = Date.now()
) {
  if (!start) return "—"
  const ms = (end ? new Date(end).getTime() : now) - new Date(start).getTime()
  const s = Math.max(Math.round(ms / 1000), 0)
  if (s < 60) return `${s}s`
  return `${Math.floor(s / 60)}m ${String(s % 60).padStart(2, "0")}s`
}

export const shortSha = (sha: string | null | undefined) =>
  sha ? sha.slice(0, 7) : "—"

/** https://github.com/user/repo(.git) -> user/repo */
export function repoPath(url: string) {
  return url.replace(/^https?:\/\/[^/]+\//, "").replace(/\.git$/, "")
}
