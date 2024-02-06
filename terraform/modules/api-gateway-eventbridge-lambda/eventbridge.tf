# resource "aws_cloudwatch_event_rule" "main" {
#   event_bus_name = var.event_bus.arn

#   event_pattern = jsonencode({
#     detail-type = [
#       var.event_bus_detail_type
#     ]
#   })

#   # TODO
#   # role_arn = ""
# }

# resource "aws_cloudwatch_event_target" "main" {
#   rule           = aws_cloudwatch_event_rule.main.name
#   arn            = aws_lambda_function.main.arn
#   event_bus_name = var.event_bus.arn

#   run_command_targets {
#     key    = "tag:Name"
#     values = ["FooBar"]
#   }

#   run_command_targets {
#     key    = "InstanceIds"
#     values = ["i-162058cd308bffec2"]
#   }
# }
