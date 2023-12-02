terraform {
  required_version = "1.6.4"

	backend "s3" {}

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "5.26.0"
    }

    external = {
      source = "hashicorp/external"
      version = "2.3.2"
    }
  }
}

provider "aws" {
  region = "eu-central-1"
	profile = "sinister-incorporated-test"

  default_tags {
    tags = {
      ManagedBy  = "Terraform"
      Repository = "simonknittel/sinister-incorporated"
    }
  }
}
