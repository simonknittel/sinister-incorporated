resource "aws_s3_bucket" "care_bear_shooter_build" {
  bucket        = "care-bear-shooter-build-${data.aws_caller_identity.current.account_id}"
  force_destroy = true
}

resource "aws_iam_role" "care_bear_shooter_build_uploader" {
  name = "care-bear-shooter-build-uploader"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRoleWithWebIdentity"
        Effect = "Allow"
        Principal = {
          Federated = data.aws_iam_openid_connect_provider.github.arn
        }
        Condition = {
          StringEquals = {
            "token.actions.githubusercontent.com:aud" = "sts.amazonaws.com"
          }
          StringLike = {
            # Related: https://docs.github.com/en/actions/deployment/security-hardening-your-deployments/about-security-hardening-with-openid-connect#customizing-the-token-claims
            "token.actions.githubusercontent.com:sub" = "repo:simonknittel/care-bear-shooter:*"
          }
        }
      }
    ]
  })
}

resource "aws_iam_role_policy" "care_bear_shooter_build_uploader_s3" {
  role = aws_iam_role.care_bear_shooter_build_uploader.id
  name = "s3"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = [
          "s3:ListBucket",
          "s3:PutObject",
          "s3:GetObject",
          "s3:DeleteObject",
        ]
        Effect = "Allow"
        Resource = [
          aws_s3_bucket.care_bear_shooter_build.arn,
          "${aws_s3_bucket.care_bear_shooter_build.arn}/*",
        ]
      },
    ]
  })
}

data "aws_iam_openid_connect_provider" "github" {
  url = "https://token.actions.githubusercontent.com"
}

resource "aws_s3_bucket_policy" "care_bear_shooter_build_cloudfront" {
  bucket = aws_s3_bucket.care_bear_shooter_build.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = [
          "s3:GetObject",
        ]
        Effect = "Allow"
        Principal = {
          Service = "cloudfront.amazonaws.com"
        }
        Resource = [
          "${aws_s3_bucket.care_bear_shooter_build.arn}/*",
        ]
        Condition = {
          StringEquals = {
            "AWS:SourceArn" = aws_cloudfront_distribution.care_bear_shooter_build.arn
          }
        }
      },
    ]
  })
}

resource "aws_s3_bucket_cors_configuration" "care_bear_shooter_build" {
  bucket = aws_s3_bucket.care_bear_shooter_build.id

  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["GET", "HEAD"]
    allowed_origins = ["*"]
    expose_headers  = []
    max_age_seconds = 3000 // 50 minutes
  }

  cors_rule {
    allowed_methods = ["GET"]
    allowed_origins = ["*"]
  }
}

resource "aws_cloudfront_distribution" "care_bear_shooter_build" {
  origin {
    domain_name              = aws_s3_bucket.care_bear_shooter_build.bucket_regional_domain_name
    origin_access_control_id = aws_cloudfront_origin_access_control.care_bear_shooter_build_bucket.id
    origin_id                = "care-bear-shooter-build"
  }

  enabled         = true
  is_ipv6_enabled = true
  http_version    = "http2and3"

  default_cache_behavior {
    allowed_methods          = ["GET", "HEAD", "OPTIONS"]
    cached_methods           = ["GET", "HEAD", "OPTIONS"]
    target_origin_id         = "care-bear-shooter-build"
    cache_policy_id          = data.aws_cloudfront_cache_policy.managed_caching_optimized.id
    viewer_protocol_policy   = "redirect-to-https"
    origin_request_policy_id = data.aws_cloudfront_origin_request_policy.managed_cors_s3_origin.id
  }

  price_class = "PriceClass_100"

  restrictions {
    geo_restriction {
      restriction_type = "whitelist"
      locations        = ["DE"]
    }
  }

  viewer_certificate {
    cloudfront_default_certificate = true
  }
}

resource "aws_cloudfront_origin_access_control" "care_bear_shooter_build_bucket" {
  name                              = "care_bear_shooter_build_sucket"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

data "aws_cloudfront_cache_policy" "managed_caching_optimized" {
  name = "Managed-CachingOptimizedForUncompressedObjects"
}

data "aws_cloudfront_origin_request_policy" "managed_cors_s3_origin" {
  name = "Managed-CORS-S3Origin"
}
