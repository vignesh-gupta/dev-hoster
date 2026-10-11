locals {
  create_redis = var.redis_url == ""
}

resource "aws_security_group" "redis" {
  count       = local.create_redis ? 1 : 0
  name        = "${var.name}-redis"
  description = "Redis access"
  vpc_id      = aws_vpc.main.id

  ingress {
    description     = "Redis from builder tasks and extra groups"
    from_port       = 6379
    to_port         = 6379
    protocol        = "tcp"
    security_groups = concat([aws_security_group.builder.id], var.redis_allowed_security_group_ids)
  }
}

resource "aws_elasticache_subnet_group" "main" {
  count      = local.create_redis ? 1 : 0
  name       = var.name
  subnet_ids = aws_subnet.public[*].id
}

resource "aws_elasticache_cluster" "main" {
  count              = local.create_redis ? 1 : 0
  cluster_id         = var.name
  engine             = "redis"
  engine_version     = "7.1"
  node_type          = var.redis_node_type
  num_cache_nodes    = 1
  port               = 6379
  subnet_group_name  = aws_elasticache_subnet_group.main[0].name
  security_group_ids = [aws_security_group.redis[0].id]
  apply_immediately  = true
}

locals {
  redis_url = local.create_redis ? "redis://${aws_elasticache_cluster.main[0].cache_nodes[0].address}:6379" : var.redis_url
}
