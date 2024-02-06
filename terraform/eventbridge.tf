resource "aws_cloudwatch_event_bus" "api_gateway" {
  name = "api-gateway"
}

resource "aws_iam_role" "api_gateway_eventbridge" {
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "apigateway.amazonaws.com"
        }
      },
    ]
  })

  inline_policy {
    name = "api-gateway-eventbridge"

    policy = jsonencode({
      Version = "2012-10-17"
      Statement = [
        {
          Effect   = "Allow"
          Action   = "events:PutEvents"
          Resource = aws_cloudwatch_event_bus.api_gateway.arn
        }
      ]
    })
  }
}
