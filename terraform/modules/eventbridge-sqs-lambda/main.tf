terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "5.83.1"
    }

    external = {
      source = "hashicorp/external"
      version = "2.3.4"
    }
  }
}
