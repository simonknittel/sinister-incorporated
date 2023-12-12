resource "aws_iam_role" "main" {
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      },
    ]
  })

  managed_policy_arns = [
    "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole",
    "arn:aws:iam::aws:policy/AWSXRayDaemonWriteAccess",
    "arn:aws:iam::aws:policy/CloudWatchLambdaInsightsExecutionRolePolicy",
  ]

  inline_policy {
    name = "parameter-store"

    policy = jsonencode({
      Version = "2012-10-17"
      Statement = [
        {
          Action = [
            "ssm:GetParameter",
            "kms:Decrypt",
          ]
          Effect = "Allow"
          Resource = [
            data.aws_ssm_parameter.mailgun_api_key.arn,
            data.aws_ssm_parameter.api_key.arn,
            data.aws_kms_alias.ssm.target_key_arn,
          ]
        },
      ]
    })
  }
}

data "aws_ssm_parameter" "mailgun_api_key" {
  name = "/${var.function_name}/mailgun-api-key"
}

data "aws_ssm_parameter" "api_key" {
  name = "/${var.function_name}/api-key"
}

data "aws_kms_alias" "ssm" {
  name = "alias/aws/ssm"
}
