output "redeployment_triggers" {
  value = [
    aws_api_gateway_resource.main,
    aws_api_gateway_method.post,
    aws_api_gateway_integration.post,
    aws_api_gateway_model.email_function_post,
  ]
}
