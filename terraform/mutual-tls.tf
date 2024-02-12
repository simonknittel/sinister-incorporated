resource "aws_s3_bucket" "mtls_truststore" {
  bucket        = "mtls-truststore-${data.aws_caller_identity.current.account_id}"
  force_destroy = true
}

resource "aws_s3_object" "mtls_truststore" {
  bucket = aws_s3_bucket.mtls_truststore.bucket
  key    = "truststore.pem"
  source = "../certificates/truststore.pem"
  etag = filemd5("../certificates/truststore.pem")
}
