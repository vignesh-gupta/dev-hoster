"use client";

import { useState, useTransition } from "react";
import { Button } from "@dev-hoster/ui/components/button";
import { Input } from "@dev-hoster/ui/components/input";  
import { createProject } from "@/lib/actions";

export function CreateProjectForm() {
  const [repoUrl, setRepoUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onSubmit(e: React.SyntheticEvent) {
    e.preventDefault();
    setError(null);

    if (!/^https:\/\/github\.com\/[\w.-]+\/[\w.-]+?(\.git)?\/?$/.test(repoUrl.trim())) {
      setError("Enter a valid GitHub repo URL, e.g. https://github.com/user/repo");
      return;
    }

    startTransition(async () => {
      try {
        await createProject(repoUrl.trim()); // creates Project + first Deployment, then redirects
      } catch {
        setError("Something went wrong. Try again.");
      }
    });
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-2 sm:flex-row">
      <Input
        value={repoUrl}
        onChange={(e) => setRepoUrl(e.target.value)}
        placeholder="https://github.com/user/repo"
        disabled={pending}
      />
      <Button type="submit" disabled={pending || !repoUrl}>
        {pending ? "Starting..." : "Build"}
      </Button>
      {error && <p className="text-sm text-destructive sm:basis-full">{error}</p>}
    </form>
  );
}