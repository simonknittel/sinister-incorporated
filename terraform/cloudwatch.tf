# https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/Best_Practice_Recommended_Alarms_AWS_Services.html

resource "aws_cloudwatch_metric_alarm" "api_gateway_5xx_error" {
  alarm_name = "api-gateway-5xx-error"

  namespace   = "AWS/ApiGateway"
  metric_name = "5XXError"

  # https://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-metrics-and-dimensions.html
  dimensions = {
    ApiName = aws_api_gateway_rest_api.main.name
  }

  statistic           = "Sum"
  comparison_operator = "GreaterThanOrEqualToThreshold"
  threshold           = 1
  evaluation_periods  = 1
  datapoints_to_alarm = 1
  period              = 60
  alarm_description   = "This alarm helps to detect a high rate of 500er responses of the API Gateway."
}

resource "aws_cloudwatch_metric_alarm" "lambda_throttles" {
  alarm_name = "lambda-throttles"

  namespace   = "AWS/Lambda"
  metric_name = "Throttles"

  statistic           = "Sum"
  comparison_operator = "GreaterThanOrEqualToThreshold"
  threshold           = 1
  evaluation_periods  = 1
  datapoints_to_alarm = 1
  period              = 60
  alarm_description   = "This alarm detects a high number of throttled invocation requests for any Lambda function."
}

resource "aws_cloudwatch_metric_alarm" "lambda_errors" {
  alarm_name = "lambda-errors"

  namespace   = "AWS/Lambda"
  metric_name = "Errors"

  statistic           = "Sum"
  comparison_operator = "GreaterThanOrEqualToThreshold"
  threshold           = 1
  evaluation_periods  = 1
  datapoints_to_alarm = 1
  period              = 60
  alarm_description   = "This alarm detects a high number of errors for any Lambda function."
}

resource "aws_cloudwatch_metric_alarm" "api_gateway_count" {
  alarm_name          = "api-gateway-count"
  comparison_operator = "GreaterThanUpperThreshold"
  evaluation_periods  = 1
  datapoints_to_alarm = 1
  alarm_description   = "This alarm helps to detect a high rate of requests to the API Gateway."
  threshold_metric_id = "e1"

  metric_query {
    id          = "e1"
    expression  = "ANOMALY_DETECTION_BAND(m1, 2)"
    label       = "Count (Expected)"
    return_data = "true"
  }

  metric_query {
    id          = "m1"
    return_data = "true"

    metric {
      metric_name = "Count"
      namespace   = "AWS/ApiGateway"
      period      = 60
      stat        = "Sum"
      unit        = "Count"

      # https://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-metrics-and-dimensions.html
      dimensions = {
        ApiName = aws_api_gateway_rest_api.main.name
      }
    }
  }
}
