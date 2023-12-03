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
