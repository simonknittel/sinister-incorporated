resource "aws_sqs_queue" "main" {
  redrive_policy = jsonencode({
    deadLetterTargetArn = aws_sqs_queue.main_deadletter.arn
    maxReceiveCount     = 2
  })
}

resource "aws_sqs_queue" "main_deadletter" {}

resource "aws_sqs_queue_redrive_allow_policy" "main_deadletter" {
  queue_url = aws_sqs_queue.main_deadletter.id

  redrive_allow_policy = jsonencode({
    redrivePermission = "byQueue",
    sourceQueueArns   = [aws_sqs_queue.main.arn]
  })
}

resource "aws_sqs_queue_policy" "main" {
  queue_url = aws_sqs_queue.main.id
  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Effect = "Allow",
        Principal = {
          AWS = [var.account_id]
        },
        Action   = ["sqs:SendMessage"],
        Resource = aws_sqs_queue.main.arn
      }
    ]
  })
}

resource "aws_lambda_permission" "api_gateway" {
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.main.function_name
  principal     = "sqs.amazonaws.com"
  source_arn    = aws_sqs_queue.main.arn
}

resource "aws_lambda_event_source_mapping" "main" {
  event_source_arn = aws_sqs_queue.main.arn
  function_name    = aws_lambda_function.main.arn
}
