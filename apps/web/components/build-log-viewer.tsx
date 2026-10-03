"use client";

import { useEffect, useRef, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";

export function BuildLogViewer({
  deploymentId,
  isLive,
}: {
  deploymentId: string;
  isLive: boolean;
}) {
  const [lines, setLines] = useState<string[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isLive) return;

    const source = new EventSource(`/api/deployments/${deploymentId}/logs`);
    source.onmessage = (event) => {
      setLines((prev) => [...prev, event.data]);
    };
    source.onerror = () => {
      source.close();
    };

    return () => source.close();
  }, [deploymentId, isLive]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [lines]);

  if (!isLive && lines.length === 0) {
    return (
      <p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
        Logs were only kept for the duration of the build and aren&apos;t available
        anymore.
      </p>
    );
  }

  return (
    <ScrollArea className="h-80 rounded-lg border bg-muted/30 p-4">
      <pre className="whitespace-pre-wrap font-mono text-xs leading-relaxed">
        {lines.join("\n")}
      </pre>
      <div ref={bottomRef} />
    </ScrollArea>
  );
}
