data "archive_file" "main" {
  output_path = "${path.module}/dist.zip"
  type        = "zip"
  output_file_mode = "0644"

  dynamic "source" {
    for_each = toset([
      "${var.source_dir}/lambda.js",
    ])

    content {
      content  = file(source.value)
      filename = basename(source.value)
    }
  }
}

data "external" "main" {
  program = [
    "bash",
    "${path.module}/commit_sha.sh",
  ]
}

# Only update the environment variable of the AWS Lambda function if the source code has changed.
resource "terraform_data" "commit_sha" {
  input = data.external.main.result.sha
  triggers_replace = data.archive_file.main.output_base64sha256

  lifecycle {
    ignore_changes = [ input ]
  }
}
