# Infrastructure (Terraform)

Provisions everything the deploy pipeline needs on AWS:

| Resource | Purpose |
| --- | --- |
| VPC (2 public subnets, no NAT) | Network for builder tasks, RDS, Redis |
| ECR `builder-server` | Builder image |
| ECS cluster + Fargate task definition `builder-server-task` | Runs one build per deployment |
| S3 bucket `<name>-outputs-<hex>` | Built sites under `__outputs/<projectId>/` (that prefix is public-read for the preview proxy) |
| RDS Postgres 17 | Web app database |
| ElastiCache Redis (optional) | Build log pub/sub |
| IAM roles, SSM SecureStrings, CloudWatch logs | Task execution, S3 upload, secrets, logs |
| IAM user `<name>-web` | Lets the web app call `ecs:RunTask` |
| IAM user `<name>-s3-uploader` | Credentials the builder script uses to upload to S3 (injected into the task via SSM) |

## Usage

```bash
cd infra
cp terraform.tfvars.example terraform.tfvars   # set web_base_url (and optionally git_pat_token)
terraform init
terraform apply
```

At the end of `apply` the outputs print:

- `web_env` / `preview_env` — ready-to-paste env for `apps/web/.env` and `apps/preview/.env` (also written to `infra/generated/*.env`, which is gitignored)
- `builder_image_push` — commands to build and push `packages/builder-server` to ECR
- `next_steps` — the remaining manual steps

Re-print any time with `terraform output web_env`.

## Things to know

- **`web_base_url` is required.** Builder tasks run in AWS and call back to the web app, so `http://localhost:3000` will not work; use a deployed URL or a tunnel (ngrok, cloudflared).
- **Redis reachability.** ElastiCache is VPC-only. If the web app runs on your machine, set `redis_url` to an external Redis (e.g. Upstash) instead; ElastiCache is then skipped.
- **Postgres** is publicly reachable but restricted to your current IP (auto-detected; disable with `detect_my_ip = false`) plus `db_allowed_cidrs`. TLS is required, so `DATABASE_URL` carries `sslmode=require`.
- **Region**: `packages/builder-server/lib/config.js` hardcodes `us-east-1` for S3, so keep that default.
- **Secrets are printed** (`nonsensitive()` in `outputs.tf`) and live in Terraform state. Don't commit state; remove `nonsensitive()` to mask them.
- `apps/preview` is not deployed by this config; run it with the printed `preview_env`.
- Dev defaults: RDS has no final snapshot or deletion protection, and `terraform destroy` empties the bucket and ECR repo.
