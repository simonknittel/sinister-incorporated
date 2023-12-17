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
        Condition = {
          StringEquals = {
            "aws:SourceAccount" = var.account_id
          }
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
            "kms:Decrypt",
            "ssm:GetParameter",
          ]
          Effect = "Allow"
          Resource = concat(
            [
              data.aws_kms_alias.ssm.target_key_arn,
            ],
            tolist(data.aws_ssm_parameter.custom[*].arn),
          )
        },
      ]
    })
  }
}

data "aws_kms_alias" "ssm" {
  name = "alias/aws/ssm"
}

data "aws_ssm_parameter" "custom" {
  count = length(var.parameter_store)
  name  = "/${var.function_name}${var.parameter_store[count.index]}"
}
