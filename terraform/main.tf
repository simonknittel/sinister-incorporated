terraform {
  required_version = "1.6.4"

  backend "s3" {}

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "5.26.0"
    }

    external = {
      source  = "hashicorp/external"
      version = "2.3.2"
    }
  }
}

provider "aws" {
  region = "eu-central-1"

  default_tags {
    tags = {
      ManagedBy  = "Terraform"
      Repository = "simonknittel/sinister-incorporated"
    }
  }
}

module "email_function" {
  source = "./modules/lambda-function"

  function_name     = "email-function"
  source_dir        = "../email-function/dist"
  rest_api          = aws_api_gateway_rest_api.main
  request_validator = aws_api_gateway_request_validator.validate_request_body
}
