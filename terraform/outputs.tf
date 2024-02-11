output "api_gateway_url" {
  value = aws_api_gateway_stage.default.invoke_url
}

output "api_gateway_custom_domain" {
  value = cloudflare_record.main_cname.hostname
}

output "care_bear_shooter_build_url" {
  value = aws_cloudfront_distribution.care_bear_shooter_build.domain_name
}
