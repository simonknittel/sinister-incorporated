output "redeployment_triggers" {
  value = [
    aws_api_gateway_method.main,
    aws_api_gateway_integration.main,
    aws_api_gateway_method_response.response_200,
    aws_api_gateway_integration_response.response_200,
    aws_api_gateway_model.request_body,
  ]
}