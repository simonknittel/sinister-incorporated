resource "aws_lambda_function" "main" {
  filename         = "${path.module}/dist.zip"
  function_name    = var.function_name
  role             = aws_iam_role.main.arn
  handler          = "index.handler"
  source_code_hash = archive_file.main.output_base64sha256
  runtime          = "nodejs20.x"
  timeout          = var.timeout
  memory_size      = 256
  architectures    = ["arm64"]

  # https://docs.aws.amazon.com/lambda/latest/dg/configuration-concurrency.html
  # https://docs.aws.amazon.com/lambda/latest/dg/gettingstarted-limits.html
  reserved_concurrent_executions = var.reserved_concurrent_executions

  tracing_config {
    mode = "Active"
  }

  layers = [
    "arn:aws:lambda:eu-central-1:187925254637:layer:AWS-Parameters-and-Secrets-Lambda-Extension-Arm64:11" # https://docs.aws.amazon.com/systems-manager/latest/userguide/ps-integration-lambda-extensions.html#ps-integration-lambda-extensions-add
  ]

  # TODO
  # lifecycle {
  #   ignore_changes = [
  #     source_code_hash # Changes to the function's source code are deployed using `.github/workflows/deploy-email-function.yml`
  #   ]
  # }
}

resource "aws_lambda_provisioned_concurrency_config" "main" {
  count = var.provisioned_concurrent_executions > 0 ? 1 : 0

  function_name                     = aws_lambda_function.main.function_name
  provisioned_concurrent_executions = var.provisioned_concurrent_executions
  qualifier                         = aws_lambda_function.main.version
}

# The resource is marked as deprecated, however, we need to use this over the data source one since we
# export the plan and reuse it later. This is not possible with the data source.
# See https://github.com/hashicorp/terraform-provider-archive/issues/218
resource "archive_file" "main" {
  source_dir       = "${path.module}/placeholder"
  output_path      = "${path.module}/dist.zip"
  type             = "zip"
  output_file_mode = "0644" # https://github.com/hashicorp/terraform-provider-archive/issues/34#issuecomment-832497296
}
