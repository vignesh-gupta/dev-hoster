"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@dev-hoster/ui/components/button"
import { Check, Copy } from "lucide-react"

export function CopyButton({
  value,
  label = "Copy",
}: {
  value: string
  label?: string
}) {
  const [copied, setCopied] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)
  useEffect(() => () => clearTimeout(timer.current), [])

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-xs"
      aria-label={copied ? "Copied" : label}
      title={copied ? "Copied" : label}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value)
          setCopied(true)
          clearTimeout(timer.current)
          timer.current = setTimeout(() => setCopied(false), 1500)
        } catch {
          // Clipboard unavailable (insecure context); nothing to do.
        }
      }}
    >
      {copied ? <Check className="text-success" /> : <Copy />}
    </Button>
  )
}
