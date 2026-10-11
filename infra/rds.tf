resource "random_password" "db" {
  length  = 24
  special = false
}

resource "aws_db_subnet_group" "main" {
  name       = var.name
  subnet_ids = aws_subnet.public[*].id
}

resource "aws_security_group" "db" {
  name        = "${var.name}-db"
  description = "Postgres access"
  vpc_id      = aws_vpc.main.id

  dynamic "ingress" {
    for_each = length(local.db_allowed_cidrs) > 0 ? [1] : []
    content {
      description = "Postgres from allowed CIDRs"
      from_port   = 5432
      to_port     = 5432
      protocol    = "tcp"
      cidr_blocks = local.db_allowed_cidrs
    }
  }
}

resource "aws_db_instance" "main" {
  identifier        = var.name
  engine            = "postgres"
  engine_version    = "17"
  instance_class    = var.db_instance_class
  allocated_storage = var.db_allocated_storage
  storage_type      = "gp3"

  db_name  = "devhoster"
  username = "devhoster"
  password = random_password.db.result

  db_subnet_group_name   = aws_db_subnet_group.main.name
  vpc_security_group_ids = [aws_security_group.db.id]
  publicly_accessible    = true

  # Dev setup: easy to tear down.
  skip_final_snapshot = true
  deletion_protection = false
  apply_immediately   = true
}
