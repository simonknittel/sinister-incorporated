resource "aws_api_gateway_method" "main" {
  rest_api_id          = var.rest_api.id
  resource_id          = var.resource.id
  http_method          = var.method
  authorization        = "NONE"
  request_validator_id = var.request_validator.id

  request_models = {
    "application/json" = aws_api_gateway_model.request_body.name
  }
}

resource "aws_api_gateway_integration" "main" {
  rest_api_id             = var.rest_api.id
  resource_id             = var.resource.id
  http_method             = aws_api_gateway_method.main.http_method
  integration_http_method = "POST"
  type                    = "AWS"
  uri                     = "arn:aws:apigateway:eu-central-1:events:action/PutEvents"
  credentials             = var.api_gateway_role.arn

  # https://docs.aws.amazon.com/eventbridge/latest/APIReference/API_PutEvents.html
  # Related: https://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-mapping-template-reference.html
  request_templates = {
    "application/json" = <<EOF
#set($context.requestOverride.header.X-Amz-Target = "AWSEvents.PutEvents")
#set($context.requestOverride.header.Content-Type = "application/x-amz-json-1.1")

#set($inputRoot = $input.json('$'))
{
  "Entries": [
    {
      "Detail": "$util.escapeJavaScript($inputRoot).replaceAll("\\'","'")",
      "DetailType": "${var.event_bus_detail_type}",
      "EventBusName": "${var.event_bus.arn}",
      "Source": "ApiGateway"
    }
  ]
}
EOF
  }

  passthrough_behavior = "NEVER"
}

resource "aws_api_gateway_method_response" "response_200" {
  rest_api_id = var.rest_api.id
  resource_id = var.resource.id
  http_method = var.method
  status_code = "200"
}

resource "aws_api_gateway_integration_response" "response_200" {
  rest_api_id = var.rest_api.id
  resource_id = var.resource.id
  http_method = var.method
  status_code = aws_api_gateway_method_response.response_200.status_code

  #Related: https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/api_gateway_integration_response
  response_templates = {
    "application/json" = <<EOF
#set($val = $input.path('$.Entries[0].EventId'))
{
  "eventId": "$val"
}
EOF
  }
}

resource "aws_api_gateway_model" "request_body" {
  rest_api_id  = var.rest_api.id
  name         = var.request_body_model_name
  description  = "Schema for the request body of ${var.function_name}/${var.method}"
  content_type = "application/json"
  schema       = var.request_body_schema
}
