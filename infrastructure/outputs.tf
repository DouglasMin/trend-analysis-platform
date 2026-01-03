output "aws_account_id" {
  description = "AWS account ID"
  value       = data.aws_caller_identity.current.account_id
}

output "aws_region" {
  description = "AWS region"
  value       = data.aws_region.current.name
}

# DynamoDB Outputs
output "dynamodb_table_name" {
  description = "DynamoDB table name"
  value       = var.dynamodb_table_name
}

output "dynamodb_table_arn" {
  description = "DynamoDB table ARN"
  value       = "arn:aws:dynamodb:${data.aws_region.current.name}:${data.aws_caller_identity.current.account_id}:table/${var.dynamodb_table_name}"
}

# ECR Outputs
output "ecr_repository_url" {
  description = "ECR repository URL"
  value       = "${data.aws_caller_identity.current.account_id}.dkr.ecr.${data.aws_region.current.name}.amazonaws.com/${var.ecr_repository_name}"
}

# Lambda Outputs
output "lambda_function_name" {
  description = "Lambda function name"
  value       = "${var.project_name}-${var.environment}"
}

# API Gateway Outputs
output "api_gateway_url" {
  description = "API Gateway URL"
  value       = "https://api.${var.project_name}.${var.environment}.example.com"
}

# S3 Outputs
output "frontend_bucket_name" {
  description = "Frontend S3 bucket name"
  value       = var.frontend_bucket_name
}

# CloudFront Outputs
output "cloudfront_distribution_domain" {
  description = "CloudFront distribution domain name"
  value       = "example.cloudfront.net"
}

output "cloudfront_distribution_id" {
  description = "CloudFront distribution ID"
  value       = "EXAMPLE123"
}
