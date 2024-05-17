resource "aws_api_gateway_resource" "email_function" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  parent_id   = aws_api_gateway_rest_api.main.root_resource_id
  path_part   = "email-function"
}

module "email_function_api_gateway" {
  source = "./modules/api-gateway-eventbridge"

  function_name           = "email-function"
  rest_api                = aws_api_gateway_rest_api.main
  resource                = aws_api_gateway_resource.email_function
  method                  = "POST"
  api_gateway_role        = aws_iam_role.api_gateway_eventbridge
  event_bus               = aws_cloudwatch_event_bus.api_gateway
  event_bus_detail_type   = "EmailRequested"
  request_validator       = aws_api_gateway_request_validator.validate_request_body
  request_body_model_name = "EmailFunctionPost"

  request_body_schema = jsonencode({
    "$schema" = "http://json-schema.org/draft-04/schema#",
    type      = "object",

    properties = {
      requestId = {
        type = "string"
      },

      template = {
        type = "string",
      },

      messages = {
        type = "array",
        items = {
          type = "object",

          properties = {
            to = {
              type = "string"
            },

            templateProps = {
              type       = "object",
              properties = {},
              additionalProperties : { type : "string" }
            },

            recipientsPublicKey = {
              type = "string"
            }
          }

          required = ["to", "templateProps"]
        }
      }
    },

    required = ["requestId", "template", "messages"]
  })
}

module "email_function" {
  source = "./modules/eventbridge-sqs-lambda"

  function_name                  = "email-function"
  reserved_concurrent_executions = 1
  account_id                     = data.aws_caller_identity.current.account_id
  timeout                        = 15
  event_bus                      = aws_cloudwatch_event_bus.api_gateway
  event_bus_detail_type          = "EmailRequested"
  dynamodb                       = aws_dynamodb_table.api_gateway_processed_requests
  parameters                     = var.email_function_parameters
}
