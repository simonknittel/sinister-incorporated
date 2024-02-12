resource "aws_acm_certificate" "main" {
  domain_name       = "${var.api_subdomain}.${data.cloudflare_zones.main.zones[0].name}"
  validation_method = "DNS"

  lifecycle {
    create_before_destroy = true
  }
}

resource "cloudflare_record" "main_validation" {
  for_each = {
    for dvo in aws_acm_certificate.main.domain_validation_options : dvo.domain_name => {
      name   = dvo.resource_record_name
      record = dvo.resource_record_value
      type   = dvo.resource_record_type
    }
  }

  zone_id = data.cloudflare_zones.main.zones[0].id
  name    = each.value.name
  value   = each.value.record
  type    = each.value.type
  proxied = false
  comment = "terraform; repository:simonknittel/simonknittel.de"
}

resource "aws_acm_certificate_validation" "main" {
  certificate_arn = aws_acm_certificate.main.arn
  validation_record_fqdns = [
    for record in cloudflare_record.main_validation : record.hostname
  ]
}

resource "aws_api_gateway_domain_name" "main" {
  depends_on = [aws_acm_certificate_validation.main]

  regional_certificate_arn = aws_acm_certificate.main.arn
  domain_name     = "${var.api_subdomain}.${data.cloudflare_zones.main.zones[0].name}"
  security_policy = "TLS_1_2"

  endpoint_configuration {
    types = ["REGIONAL"]
  }
}

resource "aws_api_gateway_base_path_mapping" "main" {
  api_id      = aws_api_gateway_rest_api.main.id
  stage_name  = aws_api_gateway_stage.default.stage_name
  domain_name = aws_api_gateway_domain_name.main.domain_name
}

resource "cloudflare_record" "main_cname" {
  zone_id = data.cloudflare_zones.main.zones[0].id
  name    = var.api_subdomain
  value   = aws_api_gateway_domain_name.main.regional_domain_name
  type    = "CNAME"
  proxied = false
  comment = "terraform; repository:simonknittel/simonknittel.de"
}
