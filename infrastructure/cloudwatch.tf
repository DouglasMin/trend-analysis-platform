resource "aws_cloudwatch_log_group" "api_gateway" {
  name              = "/aws/api-gateway/${var.project_name}-${var.environment}"
  retention_in_days = 14
  tags              = var.tags
}

resource "aws_api_gateway_account" "account" {
  cloudwatch_role_arn = aws_iam_role.apigateway_cloudwatch.arn
  depends_on = [
    aws_iam_role_policy_attachment.apigateway_logs_attachment
  ]
}
