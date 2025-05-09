terraform {
  required_version = "1.11.4"

  backend "s3" {}

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "5.96.0"
    }

    external = {
      source  = "hashicorp/external"
      version = "2.3.4"
    }

    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "4.52.0"
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

provider "cloudflare" {
  api_token = var.cloudflare_api_token
}

data "cloudflare_zones" "main" {
  filter {
    name        = "simonknittel.de"
    lookup_type = "exact"
  }
}
