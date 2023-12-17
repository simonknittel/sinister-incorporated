# Related: https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/Best_Practice_Recommended_Alarms_AWS_Services.html

resource "aws_cloudwatch_metric_alarm" "api_gateway_5xx_error" {
  alarm_name                = "api-gateway-5xx-error"

  namespace                 = "AWS/ApiGateway"
  metric_name               = "5XXError"
	# Related: https://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-metrics-and-dimensions.html
	dimensions = {
		ApiName = aws_api_gateway_rest_api.main.name
	}

  statistic                 = "Sum"
  comparison_operator       = "GreaterThanOrEqualToThreshold"
  threshold                 = 1
  evaluation_periods        = 1
	datapoints_to_alarm = 1
  period                    = 60
  alarm_description         = "This alarm helps to detect a high rate of server-side errors. This can indicate that there is something wrong on the API backend, the network, or the integration between the API gateway and the backend API."

	alarm_actions = []
}

resource "aws_cloudwatch_metric_alarm" "lambda_throttles" {
  alarm_name                = "lambda-throttles"

  namespace                 = "AWS/Lambda"
  metric_name               = "Throttles"

  statistic                 = "Sum"
  comparison_operator       = "GreaterThanOrEqualToThreshold"
  threshold                 = 1
  evaluation_periods        = 1
	datapoints_to_alarm = 1
  period                    = 60
  alarm_description         = "This alarm detects a high number of throttled invocation requests. Throttling occurs when there is no concurrency is available for scale up. There are several approaches to resolve this issue. 1) Request a concurrency increase from AWS Support in this Region. 2) Identify performance issues in the function to improve the speed of processing and therefore improve throughput. 3) Increase the batch size of the function, so that more messages are processed by each function invocation."

	alarm_actions = []
}
