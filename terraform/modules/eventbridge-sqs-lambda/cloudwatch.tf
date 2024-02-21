resource "aws_cloudwatch_metric_alarm" "deadletter_message_count" {
  alarm_name = "deadletter-message-count-${var.function_name}"

  namespace   = "AWS/SQS"
  metric_name = "ApproximateNumberOfMessagesVisible"

  # Related: https://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-metrics-and-dimensions.html
  dimensions = {
    QueueName = aws_sqs_queue.main_deadletter.name
  }

  statistic           = "Sum"
  comparison_operator = "GreaterThanOrEqualToThreshold"
  threshold           = 1
  evaluation_periods  = 1
  datapoints_to_alarm = 1
  period              = 60
  alarm_description   = "This alarm detects if there are messages in the dead letter queue."

  alarm_actions = []
}
