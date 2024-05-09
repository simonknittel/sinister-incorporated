variable "function_name" {
  type = string
}

variable "source_dir" {
  type = string
}

variable "reserved_concurrent_executions" {
  type    = number
  default = -1
}

variable "provisioned_concurrent_executions" {
  type    = number
  default = 0
}

variable "method" {
  type = string
}

variable "parameters" {
  type = list(object({
    name  = string
    value = string
  }))
  default = []
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

variable "account_id" {
  type = string
}
