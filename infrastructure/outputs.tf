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
  value       = aws_dynamodb_table.cache.name
}

output "dynamodb_table_arn" {
  description = "DynamoDB table ARN"
  value       = aws_dynamodb_table.cache.arn
}

# ECR Outputs
output "ecr_repository_url" {
  description = "ECR repository URL"
  value       = aws_ecr_repository.lambda.repository_url
}

# Lambda Outputs
output "lambda_function_names" {
  description = "Lambda function names"
  value       = { for key, fn in aws_lambda_function.backend : key => fn.function_name }
}

# API Gateway Outputs
output "api_gateway_url" {
  description = "API Gateway URL"
  value       = "https://${aws_api_gateway_rest_api.backend.id}.execute-api.${var.aws_region}.amazonaws.com/${aws_api_gateway_stage.backend.stage_name}"
}

# S3 Outputs
output "frontend_bucket_name" {
  description = "Frontend S3 bucket name"
  value       = var.enable_frontend_hosting ? aws_s3_bucket.frontend[0].bucket : null
}

# CloudFront Outputs
output "cloudfront_distribution_domain" {
  description = "CloudFront distribution domain name"
  value       = var.enable_frontend_hosting ? aws_cloudfront_distribution.frontend[0].domain_name : null
}

output "cloudfront_distribution_id" {
  description = "CloudFront distribution ID"
  value       = var.enable_frontend_hosting ? aws_cloudfront_distribution.frontend[0].id : null
}
