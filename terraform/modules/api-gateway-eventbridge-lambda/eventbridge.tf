resource "aws_cloudwatch_event_rule" "main" {
  event_bus_name = var.event_bus.arn

  event_pattern = jsonencode({
    detail-type = [
      var.event_bus_detail_type
    ]
  })
}

resource "aws_cloudwatch_event_target" "main" {
  rule           = aws_cloudwatch_event_rule.main.name
  arn            = aws_lambda_function.main.arn
  event_bus_name = var.event_bus.arn
}

resource "aws_lambda_permission" "api_gateway" {
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.main.function_name
  principal     = "events.amazonaws.com"
  source_arn    = aws_cloudwatch_event_rule.main.arn
}
