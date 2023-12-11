resource "aws_api_gateway_rest_api" "main" {
  name = "main"

  endpoint_configuration {
    types = ["REGIONAL"]
  }
}

resource "aws_api_gateway_deployment" "main" {
  rest_api_id = aws_api_gateway_rest_api.main.id

  triggers = {
    redeployment = sha1(jsonencode(concat(
      [
        aws_api_gateway_request_validator.validate_request_body,
      ],
      [
        module.email_function.redeployment_triggers,
      ]
    )))
  }

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_cloudwatch_log_group" "api_gateway_stage_test" {
  name              = "API-Gateway-Execution-Logs_${aws_api_gateway_rest_api.main.id}/test"
  retention_in_days = 7
}

resource "aws_api_gateway_stage" "test" {
  depends_on = [aws_cloudwatch_log_group.api_gateway_stage_test]

  deployment_id        = aws_api_gateway_deployment.main.id
  rest_api_id          = aws_api_gateway_rest_api.main.id
  stage_name           = "test"
  xray_tracing_enabled = true

  access_log_settings {
    destination_arn = aws_cloudwatch_log_group.api_gateway_stage_test.arn
    format = jsonencode({
      requestId               = "$context.requestId"
      extendedRequestId       = "$context.extendedRequestId"
      ip                      = "$context.identity.sourceIp"
      caller                  = "$context.identity.caller"
      user                    = "$context.identity.user"
      requestTime             = "$context.requestTime"
      httpMethod              = "$context.httpMethod"
      resourcePath            = "$context.resourcePath"
      status                  = "$context.status"
      protocol                = "$context.protocol"
      responseLength          = "$context.responseLength"
      integrationErrorMessage = "$context.integrationErrorMessage"
      errorMessage            = "$context.error.message"
      errorType               = "$context.error.responseType"
    })
  }
}

resource "aws_api_gateway_method_settings" "all" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  stage_name  = aws_api_gateway_stage.test.stage_name
  method_path = "*/*"

  settings {
    metrics_enabled = true
    logging_level   = "ERROR"
  }
}

resource "aws_api_gateway_request_validator" "validate_request_body" {
  name                  = "validate-request-body"
  rest_api_id           = aws_api_gateway_rest_api.main.id
  validate_request_body = true
}

resource "aws_api_gateway_account" "main" {
  cloudwatch_role_arn = aws_iam_role.api_gateway_cloudwatch.arn
}

resource "aws_iam_role" "api_gateway_cloudwatch" {
  name               = "api-gateway"
  assume_role_policy = data.aws_iam_policy_document.api_gateway_assume_role.json
  managed_policy_arns = [
    data.aws_iam_policy.amazon_api_gateway_push_to_cloudwatch_logs.arn,
  ]
}

data "aws_iam_policy_document" "api_gateway_assume_role" {
  statement {
    effect = "Allow"

    principals {
      type        = "Service"
      identifiers = ["apigateway.amazonaws.com"]
    }

    actions = ["sts:AssumeRole"]
  }
}

data "aws_iam_policy" "amazon_api_gateway_push_to_cloudwatch_logs" {
  arn = "arn:aws:iam::aws:policy/service-role/AmazonAPIGatewayPushToCloudWatchLogs"
}
