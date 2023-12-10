resource "aws_api_gateway_rest_api" "main" {
  name = "main"

  endpoint_configuration {
    types = ["REGIONAL"]
  }
}

resource "aws_api_gateway_resource" "email_function" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  parent_id   = aws_api_gateway_rest_api.main.root_resource_id
  path_part   = "email-function"
}

resource "aws_api_gateway_method" "email_function_post" {
  rest_api_id          = aws_api_gateway_rest_api.main.id
  resource_id          = aws_api_gateway_resource.email_function.id
  http_method          = "POST"
  authorization        = "NONE"
  request_validator_id = aws_api_gateway_request_validator.validate_request_body.id

  request_models = {
    "application/json" = aws_api_gateway_model.email_function_post.name
  }
}

resource "aws_api_gateway_integration" "email_function" {
  rest_api_id             = aws_api_gateway_rest_api.main.id
  resource_id             = aws_api_gateway_resource.email_function.id
  http_method             = aws_api_gateway_method.email_function_post.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = module.email_function.invoke_arn
}

resource "aws_api_gateway_deployment" "main" {
  rest_api_id = aws_api_gateway_rest_api.main.id

  triggers = {
    redeployment = sha1(jsonencode([
      aws_api_gateway_resource.email_function,
      aws_api_gateway_method.email_function_post,
      aws_api_gateway_integration.email_function,
      aws_api_gateway_model.email_function_post,
      aws_api_gateway_request_validator.validate_request_body
    ]))
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

resource "aws_api_gateway_model" "email_function_post" {
  rest_api_id  = aws_api_gateway_rest_api.main.id
  name         = "EmailFunctionPost"
  description  = "Schema for the request body of email-function/POST"
  content_type = "application/json"

  schema = jsonencode({
    "$schema" = "http://json-schema.org/draft-04/schema#",
    type      = "object",

    properties = {
      to = {
        type = "string"
      },
      template = {
        type = "string",
        enum = ["emailConfirmation"]
      },
      templateProps = {
        type = "object",
        properties = {
          baseUrl = {
            type = "string"
          },
          token = {
            type = "string"
          }
        }
        required = ["baseUrl", "token"]
      }
    },

    required = ["to", "template", "templateProps"]
  })
}

resource "aws_api_gateway_request_validator" "validate_request_body" {
  name                  = "validate-request-body"
  rest_api_id           = aws_api_gateway_rest_api.main.id
  validate_request_body = true
}
