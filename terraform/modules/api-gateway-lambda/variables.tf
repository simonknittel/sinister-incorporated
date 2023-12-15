variable "function_name" {
  type = string
}

variable "source_dir" {
  type = string
}

variable "method" {
  type = string
}

variable "parameter_store" {
  type = list(string)
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
