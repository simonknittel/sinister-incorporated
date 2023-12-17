data "archive_file" "main" {
  type        = "zip"
  source_dir = var.source_dir
  output_path = "${path.module}/dist.zip"
}

data "external" "main" {
  program = [
    "git",
    "log",
    "--pretty=format:{ \"sha\": \"%H\" }",
    "-1",
    "HEAD"
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
