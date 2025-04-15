terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "5.94.1"
    }

    external = {
      source  = "hashicorp/external"
      version = "2.3.4"
    }
  }
}
