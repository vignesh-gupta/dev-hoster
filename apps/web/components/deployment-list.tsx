import Link from "next/link";
import { DeploymentStatusBadge } from "@/components/deployment-status-badge";

type Deployment = {
  id: string;
  slug: string;
  status: string;
  commitSha: string | null;
  branch: string | null;
  createdAt: string;
};

export function DeploymentList({
  projectSlug,
  deployments,
}: {
  projectSlug: string;
  deployments: Deployment[];
}) {
  if (deployments.length === 0) {
    return <p className="text-sm text-muted-foreground">No deployments yet.</p>;
  }

  return (
    <div className="divide-y rounded-lg border">
      {deployments.map((d) => (
        <Link
          key={d.id}
          href={`/projects/${projectSlug}/${d.slug}`}
          className="flex items-center justify-between px-4 py-3 hover:bg-muted/50"
        >
          <div className="min-w-0">
            <p className="truncate font-mono text-sm">{d.slug}</p>
            <p className="truncate text-xs text-muted-foreground">
              {d.branch ?? "unknown branch"} &middot; {new Date(d.createdAt).toLocaleString()}
            </p>
          </div>
          <DeploymentStatusBadge status={d.status} />
        </Link>
      ))}
    </div>
  );
}
