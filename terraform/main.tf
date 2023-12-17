terraform {
  required_version = "1.6.6"

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

data "aws_caller_identity" "current" {}
