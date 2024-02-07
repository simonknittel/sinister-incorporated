resource "aws_lambda_function" "main" {
  filename                       = "${path.module}/dist.zip"
  function_name                  = var.function_name
  role                           = aws_iam_role.main.arn
  handler                        = "lambda.handler"
  source_code_hash               = data.archive_file.main.output_base64sha256
  runtime                        = "nodejs18.x"
  timeout                        = 15
  memory_size                    = 256

  # Related: https://docs.aws.amazon.com/lambda/latest/dg/gettingstarted-limits.html
  reserved_concurrent_executions = var.reserved_concurrent_executions

  environment {
    variables = {
      COMMIT_SHA = terraform_data.commit_sha.output
    }
  }

  tracing_config {
    mode = "Active"
  }

  layers = [
    "arn:aws:lambda:eu-central-1:187925254637:layer:AWS-Parameters-and-Secrets-Lambda-Extension:11" # https://docs.aws.amazon.com/systems-manager/latest/userguide/ps-integration-lambda-extensions.html#ps-integration-lambda-extensions-add
  ]
}

resource "aws_lambda_provisioned_concurrency_config" "main" {
  count = var.provisioned_concurrent_executions > 0 ? 1 : 0

  function_name                     = aws_lambda_function.main.function_name
  provisioned_concurrent_executions = var.provisioned_concurrent_executions
  qualifier                         = aws_lambda_function.main.version
}
