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

resource "aws_api_gateway_model" "request_body" {
  rest_api_id  = var.rest_api.id
  name         = var.request_body_model_name
  description  = "Schema for the request body of ${var.function_name}/${var.method}"
  content_type = "application/json"
  schema       = var.request_body_schema
}

resource "aws_api_gateway_integration" "main" {
  rest_api_id             = var.rest_api.id
  resource_id             = var.resource.id
  http_method             = aws_api_gateway_method.main.http_method
  integration_http_method = "POST"
  type                    = "AWS"
  uri                     = "arn:aws:apigateway:eu-central-1:sqs:path/${aws_sqs_queue.main.name}" # `action/SendMessage` won't work
  credentials             = var.api_gateway_role.arn

  # https://docs.aws.amazon.com/AWSSimpleQueueService/latest/APIReference/API_SendMessage.html
  # Related: https://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-mapping-template-reference.html
  request_templates = {
    # Passing a JSON object to the `SendMessage` action seems not to be working
    "application/json" = <<EOF
#set($context.requestOverride.header.X-Amz-Target = "AmazonSQS.SendMessage")
#set($context.requestOverride.header.Content-Type = "application/x-www-form-urlencoded;")
#set($inputRoot = $input.json('$'))
Action=SendMessage&MessageBody=$util.urlEncode($inputRoot)
EOF
  }

  passthrough_behavior = "NEVER"
}

resource "aws_api_gateway_integration_response" "response_200" {
  rest_api_id       = var.rest_api.id
  resource_id       = var.resource.id
  http_method       = var.method
  status_code       = aws_api_gateway_method_response.response_200.status_code
  selection_pattern = "2\\d{2}"

  #Related: https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/api_gateway_integration_response
  response_templates = {
    "application/json" = "$input.json('$')"
  }
}

resource "aws_api_gateway_method_response" "response_200" {
  rest_api_id = var.rest_api.id
  resource_id = var.resource.id
  http_method = var.method
  status_code = "200"
}

resource "aws_api_gateway_integration_response" "response_400" {
  rest_api_id       = var.rest_api.id
  resource_id       = var.resource.id
  http_method       = var.method
  status_code       = aws_api_gateway_method_response.response_400.status_code
  selection_pattern = "400"

  #Related: https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/api_gateway_integration_response
  response_templates = {
    "application/json" = "$input.json('$')"
  }
}

resource "aws_api_gateway_method_response" "response_400" {
  rest_api_id = var.rest_api.id
  resource_id = var.resource.id
  http_method = var.method
  status_code = "400"
}

resource "aws_api_gateway_integration_response" "response_404" {
  rest_api_id       = var.rest_api.id
  resource_id       = var.resource.id
  http_method       = var.method
  status_code       = aws_api_gateway_method_response.response_404.status_code
  selection_pattern = "404"

  #Related: https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/api_gateway_integration_response
  response_templates = {
    "application/json" = "$input.json('$')"
  }
}

resource "aws_api_gateway_method_response" "response_404" {
  rest_api_id = var.rest_api.id
  resource_id = var.resource.id
  http_method = var.method
  status_code = "404"
}

resource "aws_api_gateway_integration_response" "response_500" {
  rest_api_id = var.rest_api.id
  resource_id = var.resource.id
  http_method = var.method
  status_code = aws_api_gateway_method_response.response_500.status_code

  #Related: https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/api_gateway_integration_response
  response_templates = {
    "application/json" = "$input.json('$')"
  }
}

resource "aws_api_gateway_method_response" "response_500" {
  rest_api_id = var.rest_api.id
  resource_id = var.resource.id
  http_method = var.method
  status_code = "500"
}

resource "aws_api_gateway_integration_response" "response_503" {
  rest_api_id       = var.rest_api.id
  resource_id       = var.resource.id
  http_method       = var.method
  status_code       = aws_api_gateway_method_response.response_503.status_code
  selection_pattern = "503"

  #Related: https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/api_gateway_integration_response
  response_templates = {
    "application/json" = "$input.json('$')"
  }
}

resource "aws_api_gateway_method_response" "response_503" {
  rest_api_id = var.rest_api.id
  resource_id = var.resource.id
  http_method = var.method
  status_code = "503"
}
