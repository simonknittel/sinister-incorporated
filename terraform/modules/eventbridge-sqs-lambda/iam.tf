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
            tolist(aws_ssm_parameter.custom[*].arn),
          )
        },
        {
          # https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/sqs-configure-lambda-function-trigger.html#configure-lambda-function-trigger-prerequisites
          Action = [
            "sqs:DeleteMessage",
            "sqs:GetQueueAttributes",
            "sqs:ReceiveMessage"
          ]
          Effect = "Allow"
          Resource = [
            aws_sqs_queue.main.arn
          ]
        },
        {
          Action = [
            "dynamodb:GetItem",
            "dynamodb:PutItem",
          ]
          Effect = "Allow"
          Resource = [
            var.dynamodb.arn
          ]
        },
      ]
    })
  }
}

data "aws_kms_alias" "ssm" {
  name = "alias/aws/ssm"
}

resource "aws_ssm_parameter" "custom" {
  count = length(var.parameters)
  type  = "SecureString"
  name  = "/${var.function_name}${var.parameters[count.index].name}"
  value = var.parameters[count.index].value
}
