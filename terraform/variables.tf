variable "cloudflare_api_token" {
  type      = string
  sensitive = true
}

variable "api_subdomain" {
  type = string
}

variable "email_function_parameters" {
  type = list(object({
    name  = string
    value = string
  }))
  sensitive = true
}

variable "scrape_discord_events_function_environment_variables" {
  type      = map(string)
  sensitive = true
}
