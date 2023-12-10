resource "aws_api_gateway_account" "main" {
  cloudwatch_role_arn = aws_iam_role.api_gateway_cloudwatch.arn
}

resource "aws_iam_role" "api_gateway_cloudwatch" {
  name               = "api-gateway"
  assume_role_policy = data.aws_iam_policy_document.api_gateway_assume_role.json
  managed_policy_arns = [
    data.aws_iam_policy.amazon_api_gateway_push_to_cloudwatch_logs.arn,
  ]
}

data "aws_iam_policy_document" "api_gateway_assume_role" {
  statement {
    effect = "Allow"

    principals {
      type        = "Service"
      identifiers = ["apigateway.amazonaws.com"]
    }

    actions = ["sts:AssumeRole"]
  }
}

data "aws_iam_policy" "amazon_api_gateway_push_to_cloudwatch_logs" {
  arn = "arn:aws:iam::aws:policy/service-role/AmazonAPIGatewayPushToCloudWatchLogs"
}

resource "aws_lambda_permission" "email_function_api_gateway" {
  action        = "lambda:InvokeFunction"
  function_name = module.email_function.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.main.execution_arn}/*"
}
