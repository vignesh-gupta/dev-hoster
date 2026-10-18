"use client"

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { Button } from "@dev-hoster/ui/components/button"
import { cn } from "@dev-hoster/ui/lib/utils"
import { ArrowDownToLine, Check, Clipboard, Clock, WrapText } from "lucide-react"
import { keys } from "@/lib/api/hooks"
import { useUiStore } from "@/lib/stores/ui-store"
import { isTerminalStatus, type DeploymentStatus, type LogLine } from "@/lib/types"

const time = (iso: string) =>
  new Date(iso).toLocaleTimeString([], {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  })

const ansiColors: Record<number, string> = {
  30: "text-black",
  31: "text-red-400",
  32: "text-green-400",
  33: "text-yellow-300",
  34: "text-blue-400",
  35: "text-fuchsia-400",
  36: "text-cyan-300",
  37: "text-white",
  90: "text-gray-400",
  91: "text-red-300",
  92: "text-green-300",
  93: "text-yellow-200",
  94: "text-blue-300",
  95: "text-fuchsia-300",
  96: "text-cyan-200",
  97: "text-white",
}

function renderAnsi(message: string) {
  const parts: Array<{ text: string; className?: string }> = []
  const pattern = new RegExp(`${String.fromCharCode(27)}\\[([0-9;]*)m`, "g")
  let color: string | undefined
  let start = 0
  let match: RegExpExecArray | null

  while ((match = pattern.exec(message))) {
    if (match.index > start) parts.push({ text: message.slice(start, match.index), className: color })

    for (const code of (match[1] || "0").split(";").map(Number)) {
      if (code === 0 || code === 39) color = undefined
      else if (ansiColors[code]) color = ansiColors[code]
    }
    start = pattern.lastIndex
  }

  if (start < message.length) parts.push({ text: message.slice(start), className: color })
  return parts.length ? parts : [{ text: message }]
}

/**
 * Terminal-style build log. Connects to the SSE route, which replays stored lines
 * and then streams live ones until the deployment is READY or FAILED.
 */
export function BuildLogViewer({
  deploymentId,
  status,
}: {
  deploymentId: string
  status: DeploymentStatus
}) {
  const qc = useQueryClient()
  const [lines, setLines] = useState<LogLine[]>([])
  const [streaming, setStreaming] = useState(!isTerminalStatus(status))
  const [copied, setCopied] = useState(false)
  const { logWrap, logTimestamps, logFollow, setLogPref } = useUiStore()
  const scroller = useRef<HTMLDivElement>(null)
  const buffer = useRef<LogLine[]>([])
  const raf = useRef(0)

  const flush = useCallback(() => {
    raf.current = 0
    const batch = buffer.current
    buffer.current = []
    if (batch.length) setLines((prev) => [...prev, ...batch])
  }, [])

  useEffect(() => {
    const es = new EventSource(`/api/deployments/${deploymentId}/logs`)
    // The server replays everything on (re)connect, so start clean each time.
    es.addEventListener("open", () => {
      buffer.current = []
      setLines([])
      setStreaming(true)
    })
    es.addEventListener("log", (e) => {
      const { ts, level, message } = JSON.parse((e as MessageEvent).data)
      buffer.current.push({ ts, level, message })
      raf.current ||= requestAnimationFrame(flush)
    })
    es.addEventListener("status", (e) => {
      const { status: next } = JSON.parse((e as MessageEvent).data)
      if (isTerminalStatus(next)) {
        es.close()
        flush()
        setStreaming(false)
        qc.invalidateQueries({ queryKey: keys.deployments })
        qc.invalidateQueries({ queryKey: keys.projects })
      }
    })
    return () => {
      es.close()
      cancelAnimationFrame(raf.current)
    }
  }, [deploymentId, flush, qc])

  // Stick to the bottom while following.
  useLayoutEffect(() => {
    const el = scroller.current
    if (el && logFollow) el.scrollTop = el.scrollHeight
  }, [lines, logFollow])

  const text = lines.map((l) => `${l.ts} ${l.message}`).join("\n")

  return (
    <div className="border bg-[oklch(0.17_0.006_60)] text-[oklch(0.9_0.01_70)]">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 px-3 py-1.5">
        <div className="flex items-center gap-2 text-xs">
          <span
            aria-hidden
            className={cn(
              "size-1.5 rounded-full",
              streaming ? "animate-pulse bg-primary" : "bg-white/30"
            )}
          />
          <span className="font-medium">Build logs</span>
          <span className="text-white/60" aria-live="polite">
            {streaming ? "Streaming…" : `${lines.length} lines`}
          </span>
        </div>
        <div className="flex items-center gap-0.5">
          <LogToggle
            pressed={logTimestamps}
            onClick={() => setLogPref("logTimestamps", !logTimestamps)}
            icon={Clock}
            label="Timestamps"
          />
          <LogToggle
            pressed={logWrap}
            onClick={() => setLogPref("logWrap", !logWrap)}
            icon={WrapText}
            label="Wrap"
          />
          <LogToggle
            pressed={logFollow}
            onClick={() => setLogPref("logFollow", !logFollow)}
            icon={ArrowDownToLine}
            label="Follow"
          />
          <Button
            variant="ghost"
            size="xs"
            className="text-white/80 hover:bg-white/10 hover:text-white"
            disabled={!lines.length}
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(text)
                setCopied(true)
                setTimeout(() => setCopied(false), 1500)
              } catch {
                // clipboard unavailable
              }
            }}
          >
            {copied ? <Check /> : <Clipboard />}
            {copied ? "Copied" : "Copy"}
          </Button>
        </div>
      </div>

      <div
        ref={scroller}
        role="log"
        aria-label="Build log output"
        tabIndex={0}
        onScroll={(e) => {
          const el = e.currentTarget
          const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 32
          if (!atBottom && logFollow) setLogPref("logFollow", false)
        }}
        className="max-h-112 min-h-44 overflow-auto py-2 font-mono text-xs leading-5 outline-none focus-visible:ring-1 focus-visible:ring-ring"
      >
        {lines.length === 0 ? (
          <p className="px-3 py-1 text-white/60">
            {streaming
              ? "Waiting for the builder to start…"
              : "No logs were recorded for this deployment."}
          </p>
        ) : (
          lines.map((l, i) => (
            <div
              key={i}
              className={cn(
                "flex gap-3 px-3 hover:bg-white/5",
                l.level === "error" && "text-[oklch(0.78_0.14_25)]",
                l.level === "warn" && "text-[oklch(0.85_0.13_85)]"
              )}
            >
              <span aria-hidden className="w-6 shrink-0 text-right text-white/35 tabular-nums select-none">
                {i + 1}
              </span>
              {logTimestamps && (
                <span className="shrink-0 text-white/45 tabular-nums select-none">
                  {time(l.ts)}
                </span>
              )}
              <span
                className={cn(
                  "min-w-0 flex-1",
                  logWrap ? "wrap-break-word whitespace-pre-wrap" : "whitespace-pre"
                )}
              >
                {renderAnsi(l.message).map((part, index) => (
                  <span key={index} className={part.className}>
                    {part.text}
                  </span>
                ))}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

function LogToggle({
  pressed,
  onClick,
  icon: Icon,
  label,
}: {
  pressed: boolean
  onClick: () => void
  icon: typeof Clock
  label: string
}) {
  return (
    <Button
      variant="ghost"
      size="xs"
      aria-pressed={pressed}
      onClick={onClick}
      className={cn(
        "text-white/70 hover:bg-white/10 hover:text-white",
        pressed && "bg-white/10 text-white"
      )}
    >
      <Icon />
      {label}
    </Button>
  )
}
