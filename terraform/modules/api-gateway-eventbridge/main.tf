terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "5.44.0"
    }

    external = {
      source = "hashicorp/external"
      version = "2.3.3"
    }
  }
}
