resource "aws_dynamodb_table" "api_gateway_processed_requests" {
  name         = "ApiGatewayProcessedRequests"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "RequestId"

  attribute {
    name = "RequestId"
    type = "S"
  }

  ttl {
    attribute_name = "ExpiresAt"
    enabled        = true
  }
}
