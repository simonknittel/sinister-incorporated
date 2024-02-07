resource "aws_api_gateway_resource" "email_function" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  parent_id   = aws_api_gateway_rest_api.main.root_resource_id
  path_part   = "email-function"
}

module "email_function" {
  source = "./modules/api-gateway-eventbridge-lambda"

  function_name                  = "email-function"
  source_dir                     = "../email-function/dist"
  reserved_concurrent_executions = 10
  rest_api                       = aws_api_gateway_rest_api.main
  resource                       = aws_api_gateway_resource.email_function
  method                         = "POST"
  account_id                     = data.aws_caller_identity.current.account_id

  parameter_store = [
    "/mailgun-api-key"
  ]

  event_bus             = aws_cloudwatch_event_bus.api_gateway
  api_gateway_role      = aws_iam_role.api_gateway_eventbridge
  event_bus_detail_type = "EmailConfirmationRequested"

  request_validator       = aws_api_gateway_request_validator.validate_request_body
  request_body_model_name = "EmailFunctionPost"
  request_body_schema = jsonencode({
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
