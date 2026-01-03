variable "aws_region" {
  description = "AWS region for resources"
  type        = string
  default     = "ap-northeast-2"
}

variable "aws_profile" {
  description = "AWS CLI profile to use"
  type        = string
  default     = "dongik2"
}

variable "aws_account_id" {
  description = "AWS account ID"
  type        = string
  default     = "863518440691"
}

variable "environment" {
  description = "Environment name (dev, staging, prod)"
  type        = string
  default     = "dev"
}

variable "project_name" {
  description = "Project name for resource naming"
  type        = string
  default     = "trend-analysis"
}

# DynamoDB Configuration
variable "dynamodb_table_name" {
  description = "DynamoDB table name for caching"
  type        = string
  default     = "trend-analysis-cache"
}

variable "dynamodb_billing_mode" {
  description = "DynamoDB billing mode (PROVISIONED or PAY_PER_REQUEST)"
  type        = string
  default     = "PAY_PER_REQUEST"
}

# Lambda Configuration
variable "lambda_timeout" {
  description = "Lambda function timeout in seconds"
  type        = number
  default     = 30
}

variable "lambda_memory" {
  description = "Lambda function memory in MB"
  type        = number
  default     = 512
}

variable "serpapi_key" {
  description = "SerpAPI key for trend data"
  type        = string
  sensitive   = true
}

# ECR Configuration
variable "ecr_repository_name" {
  description = "ECR repository name for Lambda Docker images"
  type        = string
  default     = "trend-analysis-lambda"
}

# S3 Configuration
variable "frontend_bucket_name" {
  description = "S3 bucket name for frontend hosting"
  type        = string
  default     = "trend-analysis-frontend"
}

variable "enable_frontend_hosting" {
  description = "Whether to create S3 + CloudFront resources for frontend hosting"
  type        = bool
  default     = true
}

# CloudFront Configuration
variable "cloudfront_price_class" {
  description = "CloudFront price class"
  type        = string
  default     = "PriceClass_100"
}

# Tags
variable "tags" {
  description = "Additional tags for resources"
  type        = map(string)
  default     = {}
}
