resource "aws_api_gateway_rest_api" "backend" {
  name = "${var.project_name}-${var.environment}-api"
  tags = var.tags
}

locals {
  api_route_targets = {
    "trends/interest-over-time"      = "interest_over_time"
    "trends/interest-by-region"      = "interest_by_region"
    "trends/compared-by-region"      = "compared_breakdown_by_region"
    "trends/related-queries"         = "related_queries"
    "trends/related-topics"          = "related_topics"
    "trends/trending-now"            = "trending_now"
    "trends/news"                    = "news_trends"
    "trends/shopping"                = "shopping_trends"
    "trends/comprehensive-report"    = "comprehensive_report"
  }

  api_routes = {
    for route, key in local.api_route_targets :
    route => try(aws_lambda_function.backend[key].invoke_arn, null)
    if try(aws_lambda_function.backend[key].invoke_arn, null) != null
  }
}

resource "aws_api_gateway_resource" "trends" {
  rest_api_id = aws_api_gateway_rest_api.backend.id
  parent_id   = aws_api_gateway_rest_api.backend.root_resource_id
  path_part   = "trends"
}

resource "aws_api_gateway_resource" "route_children" {
  for_each = local.api_routes
  rest_api_id = aws_api_gateway_rest_api.backend.id
  parent_id   = aws_api_gateway_resource.trends.id
  path_part   = split("/", each.key)[1]
}

resource "aws_api_gateway_method" "route_any" {
  for_each      = local.api_routes
  rest_api_id   = aws_api_gateway_rest_api.backend.id
  resource_id   = aws_api_gateway_resource.route_children[each.key].id
  http_method   = "ANY"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "route_any" {
  for_each                = local.api_routes
  rest_api_id             = aws_api_gateway_rest_api.backend.id
  resource_id             = aws_api_gateway_resource.route_children[each.key].id
  http_method             = aws_api_gateway_method.route_any[each.key].http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = each.value
}

resource "aws_lambda_permission" "apigw" {
  for_each      = local.api_routes
  statement_id  = "AllowExecutionFromAPIGateway-${replace(each.key, "/", "-")}"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.backend[local.api_route_targets[each.key]].function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.backend.execution_arn}/*/*"
}

resource "aws_api_gateway_deployment" "backend" {
  rest_api_id = aws_api_gateway_rest_api.backend.id
  depends_on = [
    aws_api_gateway_integration.route_any,
  ]
}

resource "aws_api_gateway_stage" "backend" {
  rest_api_id   = aws_api_gateway_rest_api.backend.id
  deployment_id = aws_api_gateway_deployment.backend.id
  stage_name    = var.environment
  tags          = var.tags
  depends_on    = [aws_api_gateway_account.account]

  access_log_settings {
    destination_arn = aws_cloudwatch_log_group.api_gateway.arn
    format = jsonencode({
      requestId    = "$context.requestId"
      ip           = "$context.identity.sourceIp"
      httpMethod   = "$context.httpMethod"
      resourcePath = "$context.resourcePath"
      status       = "$context.status"
      responseSize = "$context.responseLength"
      userAgent    = "$context.identity.userAgent"
      errorMessage = "$context.error.message"
    })
  }
}

resource "aws_api_gateway_method_settings" "all" {
  rest_api_id = aws_api_gateway_rest_api.backend.id
  stage_name  = aws_api_gateway_stage.backend.stage_name
  method_path = "*/*"

  settings {
    logging_level      = "INFO"
    metrics_enabled    = true
    data_trace_enabled = false
  }
}
