resource "aws_iam_role" "api_gateway_sqs" {
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
    name = "api-gateway-sqs"

    policy = jsonencode({
      Version = "2012-10-17"
      Statement = [
        {
          Effect = "Allow"
          Action = [
            "sqs:SendMessage",
          ]
          Resource = "arn:aws:sqs:eu-central-1:${data.aws_caller_identity.current.account_id}:*"
        }
      ]
    })
  }
}
