variable "function_name" {
  type = string
}

variable "method" {
  type = string
}

variable "rest_api" {
  type = object({
    id            = string
    execution_arn = string
  })
}

variable "resource" {
  type = object({
    id = string
  })
}

variable "request_validator" {
  type = object({
    id = string
  })
}

variable "request_body_model_name" {
  type = string
}

variable "request_body_schema" {
  type = string
}

variable "event_bus" {
  type = object({
    arn = string
  })
}

variable "api_gateway_role" {
  type = object({
    arn = string
  })
}

variable "event_bus_detail_type" {
  type = string
}
