resource "aws_budgets_budget" "monthly_total" {
  name              = "Total monthly budget"
  budget_type       = "COST"
  limit_amount      = "10"
  limit_unit        = "USD"
  time_period_start = "2023-12-01_00:00"
  time_unit         = "MONTHLY"

  notification {
    comparison_operator        = "GREATER_THAN"
    threshold                  = 100
    threshold_type             = "PERCENTAGE"
    notification_type          = "FORECASTED"
    subscriber_email_addresses = ["hallo@simonknittel.de"]
  }

  notification {
    comparison_operator        = "GREATER_THAN"
    threshold                  = 75
    threshold_type             = "PERCENTAGE"
    notification_type          = "FORECASTED"
    subscriber_email_addresses = ["hallo@simonknittel.de"]
  }

  notification {
    comparison_operator        = "GREATER_THAN"
    threshold                  = 50
    threshold_type             = "PERCENTAGE"
    notification_type          = "FORECASTED"
    subscriber_email_addresses = ["hallo@simonknittel.de"]
  }
}
