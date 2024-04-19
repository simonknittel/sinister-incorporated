terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "5.45.0"
    }

    external = {
      source = "hashicorp/external"
      version = "2.3.3"
    }
  }
}
