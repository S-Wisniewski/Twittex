provider "aws" {
  region = "eu-central-1"
}

resource "aws_ecr_repository" "twittex_repo" {
  name                 = "twittex-app"
  image_tag_mutability = "MUTABLE"
  force_delete         = true
}

resource "aws_ecr_lifecycle_policy" "cleanup" {
  repository = aws_ecr_repository.twittex_repo.name
  policy = jsonencode({
    rules = [{
      rulePriority = 1
      description  = "Keep last 3 images"
      selection = {
        tagStatus     = "any"
        countType     = "imageCountMoreThan"
        countNumber   = 3
      }
      action = { type = "expire" }
    }]
  })
}

data "aws_vpc" "default" {
  default = true
}

resource "aws_db_instance" "twittex_db" {
  allocated_storage     = 20
  max_allocated_storage = 20
  engine                = "postgres"
  engine_version        = "15.4"
  instance_class        = "db.t3.micro"
  db_name               = "twittexdb"
  username              = "twittex_admin"
  password              = var.db_password
  
  skip_final_snapshot  = true      
  publicly_accessible  = true
  multi_az             = false
  storage_type         = "gp2"
  
  vpc_security_group_ids = [aws_security_group.rds_sg.id]
}

resource "aws_security_group" "rds_sg" {
  name   = "twittex-rds-sg-cheap"
  vpc_id = data.aws_vpc.default.id

  ingress {
    from_port   = 5432
    to_port     = 5432
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

output "ecr_url" {
  value = aws_ecr_repository.twittex_repo.repository_url
}

output "rds_endpoint" {
  value = aws_db_instance.twittex_db.endpoint
}