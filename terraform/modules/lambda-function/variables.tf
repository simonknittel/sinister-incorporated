variable "function_name" {
  type = string
}

variable "source_dir" {
  type = string
}

variable "rest_api" {
  type = object({
    id               = string
    execution_arn    = string
    root_resource_id = string
  })
}

variable "request_validator" {
  type = object({
    id = string
  })
}
