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
  engine_version        = "15"
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

resource "aws_security_group" "ec2_sg" {
  name   = "twittex-ec2-sg"
  vpc_id = data.aws_vpc.default.id

  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 80
    to_port     = 80
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

resource "aws_instance" "app_server" {
  ami           = "ami-04e601abe3e1a910f" # Ubuntu 22.04 LTS Frankfurt
  instance_type = "t3.micro"

  vpc_security_group_ids = [aws_security_group.ec2_sg.id]

  user_data = <<-EOF
              #!/bin/bash
              sudo apt-get update
              sudo apt-get install -y docker.io
              sudo systemctl start docker
              sudo systemctl enable docker
              sudo usermod -aG docker ubuntu
              EOF

  tags = {
    Name = "twittex-server"
  }
}

resource "aws_cognito_user_pool" "twittex_user_pool" {
  name = "twittex-user-pool"

  username_attributes      = ["email"]
  auto_verified_attributes = ["email"]

  password_policy {
    minimum_length    = 8
    require_lowercase = true
    require_numbers   = true
    require_symbols   = true
    require_uppercase = true
  }

  account_recovery_setting {
    recovery_mechanism {
      name     = "verified_email"
      priority = 1
    }
  }
}

resource "aws_cognito_user_pool_client" "twittex_client" {
  name         = "twittex-app-client"
  user_pool_id = aws_cognito_user_pool.twittex_user_pool.id

  generate_secret     = false
  explicit_auth_flows = ["ALLOW_USER_PASSWORD_AUTH", "ALLOW_REFRESH_TOKEN_AUTH", "ALLOW_USER_SRP_AUTH"]
}

output "ecr_url" {
  value = aws_ecr_repository.twittex_repo.repository_url
}

output "rds_endpoint" {
  value = aws_db_instance.twittex_db.endpoint
}

output "ec2_public_ip" {
  value = aws_instance.app_server.public_ip
}

output "cognito_user_pool_id" {
  value = aws_cognito_user_pool.twittex_user_pool.id
}

output "cognito_client_id" {
  value = aws_cognito_user_pool_client.twittex_client.id
}