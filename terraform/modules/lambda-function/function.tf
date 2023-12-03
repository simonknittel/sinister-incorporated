resource "aws_lambda_function" "main" {
  filename      = "${path.module}/dist.zip"
  function_name = var.function_name
  role          = aws_iam_role.main.arn
  handler       = "lambda.handler"

  source_code_hash = data.archive_file.main.output_base64sha256

  runtime = "nodejs18.x"

  environment {
    variables = {
      COMMIT_SHA = data.external.main.result.sha
    }
  }

  tracing_config {
    mode = "Active"
  }
}

resource "aws_lambda_function_url" "main" {
  function_name      = aws_lambda_function.main.function_name
  authorization_type = "NONE"
}
