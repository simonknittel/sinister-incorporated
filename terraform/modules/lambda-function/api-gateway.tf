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
  integration_http_method = var.method
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.main.invoke_arn
}

resource "aws_api_gateway_model" "request_body" {
  rest_api_id  = var.rest_api.id
  name         = var.request_body_model_name
  description  = "Schema for the request body of ${var.function_name}/${var.method}"
  content_type = "application/json"
  schema       = var.request_body_schema
}

resource "aws_lambda_permission" "api_gateway" {
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.main.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${var.rest_api.execution_arn}/*"
}
