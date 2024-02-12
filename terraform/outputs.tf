output "api_gateway_url" {
  value = "https://${cloudflare_record.main_cname.hostname}"
}

output "care_bear_shooter_build_url" {
  value = aws_cloudfront_distribution.care_bear_shooter_build.domain_name
}
