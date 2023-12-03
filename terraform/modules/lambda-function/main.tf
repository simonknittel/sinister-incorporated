terraform {
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
