resource "aws_api_gateway_resource" "main" {
  rest_api_id = var.rest_api.id
  parent_id   = var.rest_api.root_resource_id
  path_part   = "email-function"
}

resource "aws_api_gateway_method" "post" {
  rest_api_id          = var.rest_api.id
  resource_id          = aws_api_gateway_resource.main.id
  http_method          = "POST"
  authorization        = "NONE"
  request_validator_id = var.request_validator.id

  request_models = {
    "application/json" = aws_api_gateway_model.email_function_post.name
  }
}

resource "aws_api_gateway_integration" "post" {
  rest_api_id             = var.rest_api.id
  resource_id             = aws_api_gateway_resource.main.id
  http_method             = aws_api_gateway_method.post.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.main.invoke_arn
}

resource "aws_api_gateway_model" "email_function_post" {
  rest_api_id  = var.rest_api.id
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

resource "aws_lambda_permission" "api_gateway" {
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.main.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${var.rest_api.execution_arn}/*"
}
