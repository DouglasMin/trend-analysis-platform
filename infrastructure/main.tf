terraform {
  required_version = ">= 1.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  # Backend configuration for state management
  # Uncomment and configure after creating S3 bucket for state
  # backend "s3" {
  #   bucket         = "trend-analysis-terraform-state"
  #   key            = "terraform.tfstate"
  #   region         = "us-east-1"
  #   profile        = "dongik2"
  #   encrypt        = true
  #   dynamodb_table = "terraform-state-lock"
  # }
}

provider "aws" {
  region  = var.aws_region
  profile = var.aws_profile

  default_tags {
    tags = {
      Project     = "web-trend-analysis-platform"
      Environment = var.environment
      ManagedBy   = "Terraform"
    }
  }
}

# Data source for AWS account ID
data "aws_caller_identity" "current" {}

# Data source for AWS region
data "aws_region" "current" {}
