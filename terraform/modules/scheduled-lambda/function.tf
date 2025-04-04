resource "aws_lambda_function" "main" {
  filename         = "${path.module}/placeholder.zip" # cd placeholder && zip -r ../placeholder.zip .
  function_name    = var.function_name
  role             = aws_iam_role.main.arn
  handler          = "index.handler"
  source_code_hash = filebase64sha256("${path.module}/placeholder.zip")
  runtime          = "nodejs22.x"
  timeout          = var.timeout
  memory_size      = 192
  architectures    = ["arm64"]

  # https://docs.aws.amazon.com/lambda/latest/dg/configuration-concurrency.html
  # https://docs.aws.amazon.com/lambda/latest/dg/gettingstarted-limits.html
  reserved_concurrent_executions = 1

  tracing_config {
    mode = "Active"
  }

  lifecycle {
    # Changes to the function's source code are deployed using `.github/workflows/deploy-email-function.yml`
    ignore_changes = [
      filename,
      source_code_hash
    ]
  }

  environment {
    variables = var.environment_variables
  }
}
