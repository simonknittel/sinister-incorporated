data "aws_iam_policy_document" "main" {
  statement {
    effect = "Allow"

    principals {
      type        = "Service"
      identifiers = ["lambda.amazonaws.com"]
    }

    actions = ["sts:AssumeRole"]
  }
}

data "aws_iam_policy" "aws_lambda_basic_execution_role" {
  arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

data "aws_iam_policy" "aws_xray_daemon_write_access" {
  arn = "arn:aws:iam::aws:policy/AWSXRayDaemonWriteAccess"
}

data "aws_iam_policy" "cloudwatch_lambda_insights_execution_role_policy" {
  arn = "arn:aws:iam::aws:policy/CloudWatchLambdaInsightsExecutionRolePolicy"
}

data "aws_ssm_parameter" "mailgun_api_key" {
  name = "/${var.function_name}/mailgun-api-key"
}

data "aws_kms_alias" "ssm" {
  name = "alias/aws/ssm"
}

resource "aws_iam_policy" "parameter_store" {
  name        = "email-function-parameter-store"
  path        = "/"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = [
          "ssm:GetParameter",
          "kms:Decrypt",
        ]
        Effect   = "Allow"
        Resource = [
          data.aws_ssm_parameter.mailgun_api_key.arn,
          data.aws_kms_alias.ssm.target_key_arn,
        ]
      },
    ]
  })
}

resource "aws_iam_role" "main" {
  name               = var.function_name
  assume_role_policy = data.aws_iam_policy_document.main.json
	managed_policy_arns = [
		data.aws_iam_policy.aws_lambda_basic_execution_role.arn,
		data.aws_iam_policy.aws_xray_daemon_write_access.arn,
		data.aws_iam_policy.cloudwatch_lambda_insights_execution_role_policy.arn,
    aws_iam_policy.parameter_store.arn,
	]
}
