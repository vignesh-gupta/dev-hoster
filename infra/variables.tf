variable "name" {
  description = "Prefix used for resource names."
  type        = string
  default     = "dev-hoster"
}

variable "aws_region" {
  description = "AWS region. Keep us-east-1 unless you also change packages/builder-server/lib/config.js, which hardcodes the S3 region."
  type        = string
  default     = "us-east-1"
}

variable "web_base_url" {
  description = "URL the builder tasks use to call back into the Next.js app (PATCH /api/deployments/:id/status). Must be reachable from the internet, e.g. a deployed URL or an ngrok/cloudflared tunnel."
  type        = string

  validation {
    condition     = can(regex("^https?://", var.web_base_url))
    error_message = "web_base_url must start with http:// or https://."
  }
}

variable "git_pat_token" {
  description = "GitHub PAT the builder uses to clone repos. Leave empty for public repos only."
  type        = string
  default     = ""
  sensitive   = true
}

variable "vpc_cidr" {
  type    = string
  default = "10.20.0.0/16"
}

# --- Database ----------------------------------------------------------------

variable "detect_my_ip" {
  description = "Allow your current public IP (via checkip.amazonaws.com) to reach Postgres."
  type        = bool
  default     = true
}

variable "db_allowed_cidrs" {
  description = "Additional CIDRs allowed to reach Postgres (e.g. where the web app is hosted)."
  type        = list(string)
  default     = []
}

variable "db_instance_class" {
  type    = string
  default = "db.t4g.micro"
}

variable "db_allocated_storage" {
  type    = number
  default = 20
}

# --- Redis -------------------------------------------------------------------

variable "redis_url" {
  description = "Use an existing Redis (e.g. Upstash) instead of creating ElastiCache. ElastiCache is VPC-only, so the web app can only subscribe to logs from inside the VPC; set this if the web app runs elsewhere."
  type        = string
  default     = ""
}

variable "redis_node_type" {
  type    = string
  default = "cache.t4g.micro"
}

variable "redis_allowed_security_group_ids" {
  description = "Extra security groups (e.g. the web app's) allowed to reach ElastiCache."
  type        = list(string)
  default     = []
}

# --- Builder task ------------------------------------------------------------

variable "builder_cpu" {
  type    = number
  default = 1024
}

variable "builder_memory" {
  type    = number
  default = 3072
}

variable "builder_image_tag" {
  type    = string
  default = "latest"
}

variable "create_web_iam_user" {
  description = "Create an IAM user (with access key) that lets the web app call ecs:RunTask. Disable if the web app runs with its own IAM role."
  type        = bool
  default     = true
}

variable "preview_port" {
  type    = number
  default = 8000
}

variable "create_uploader_iam_user" {
  description = "Create an IAM user (with access key) scoped to uploading build output to S3, and inject its credentials into the builder task as AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY."
  type        = bool
  default     = true
}
