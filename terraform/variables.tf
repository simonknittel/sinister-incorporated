variable "cloudflare_api_token" {
  type      = string
  sensitive = true
}

variable "api_subdomain" {
  type = string
}

variable "email_function_mailgun_api_key" {
  type      = string
  sensitive = true
}

variable "email_function_parameters" {
  type = list(object({
    name  = string
    value = string
  }))
  sensitive = true
}
