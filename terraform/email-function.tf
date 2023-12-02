data "aws_iam_policy_document" "email_function" {
  statement {
    effect = "Allow"

    principals {
      type        = "Service"
      identifiers = ["lambda.amazonaws.com"]
    }

    actions = ["sts:AssumeRole"]
  }
}

resource "aws_iam_role" "email_function" {
  name               = "email-function"
  assume_role_policy = data.aws_iam_policy_document.email_function.json
}

data "archive_file" "email_function" {
  type        = "zip"
  source_dir = "../email-function/dist"
  output_path = "../email-function/dist.zip"
}

resource "aws_lambda_function" "email_function" {
  filename      = "../email-function/dist.zip"
  function_name = "email-function"
  role          = aws_iam_role.email_function.arn
  handler       = "index.handler"

  source_code_hash = data.archive_file.email_function.output_base64sha256

  runtime = "nodejs18.x"

  environment {
    variables = {}
  }

  tracing_config {
    mode = "Active"
  }
}

resource "aws_lambda_function_url" "email_function" {
  function_name      = aws_lambda_function.email_function.function_name
  authorization_type = "NONE"
}
