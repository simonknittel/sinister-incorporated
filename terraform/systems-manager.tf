resource "aws_ssm_parameter" "email_function_mailgun_api_key" {
  name  = "/email-function/mailgun-api-key"
  type  = "SecureString"
  value = var.email_function_mailgun_api_key
}
