locals {
  lambda_handlers = {
    interest_over_time           = "index.interestOverTimeHandler"
    interest_by_region           = "index.interestByRegionHandler"
    compared_breakdown_by_region = "index.comparedBreakdownByRegionHandler"
    related_queries              = "index.relatedQueriesHandler"
    related_topics               = "index.relatedTopicsHandler"
    trending_now                 = "index.trendingNowHandler"
    news_trends                  = "index.newsTrendsHandler"
    shopping_trends              = "index.shoppingTrendsHandler"
    comprehensive_report         = "index.comprehensiveReportHandler"
  }
}

resource "aws_lambda_function" "backend" {
  for_each      = local.lambda_handlers
  function_name = "${var.project_name}-${var.environment}-${each.key}"
  package_type  = "Image"
  role          = aws_iam_role.lambda_execution.arn
  timeout       = var.lambda_timeout
  memory_size   = var.lambda_memory

  image_uri = "${aws_ecr_repository.lambda.repository_url}:latest"

  image_config {
    command = [each.value]
  }

  environment {
    variables = {
      SERPAPI_KEY    = var.serpapi_key
      DYNAMODB_TABLE = aws_dynamodb_table.cache.name
    }
  }

  depends_on = [
    aws_iam_role_policy_attachment.lambda_basic_logging,
    aws_iam_role_policy_attachment.lambda_policy_attachment,
  ]
}

resource "aws_cloudwatch_log_group" "lambda" {
  for_each          = aws_lambda_function.backend
  name              = "/aws/lambda/${each.value.function_name}"
  retention_in_days = 14
  tags              = var.tags
}
