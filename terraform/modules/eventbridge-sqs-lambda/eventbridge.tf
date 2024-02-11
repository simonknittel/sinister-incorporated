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
  arn            = aws_sqs_queue.main.arn
  event_bus_name = var.event_bus.arn
  input_path     = "$.detail"
}
