# Setup Test and Production

## 1. Set up PlanetScale

## 2. Set up Mailgun

1. Create API keys for sending

   1. `sinister-incorporated-aws-test`
   2. `sinister-incorporated-aws-prod`

## 2. Set up AWS and Terraform

1. Create two AWS accounts

   1. `sinister-incorporated-test`
   2. `sinister-incorporated-prod`

2. Prepare AWS CLI

```ini
# ~/.aws/config

[profile sinister-incorporated-test]
sso_session = sinister-incorporated-sso
sso_account_id = 220746603587
sso_role_name = AdministratorAccess

[profile sinister-incorporated-prod]
sso_session = sinister-incorporated-sso
sso_account_id =
sso_role_name = AdministratorAccess

[sso-session sinister-incorporated-sso]
sso_region = eu-central-1
sso_start_url = https://simonknittel.awsapps.com/start
```

3. Create a Amazon S3 bucket for Terraform backends (make sure to use a globally unique bucket name)

   1. `aws sso login --profile sinister-incorporated-test && aws --profile sinister-incorporated-test --region eu-central-1 s3api create-bucket --bucket terraform-backend-aowb47tawo48wvt4 --create-bucket-configuration LocationConstraint=eu-central-1 --object-ownership BucketOwnerEnforced`

4. Create parameters in AWS System Manager (make sure to replace `foobar` with the actual values)

   1. `aws sso login --profile sinister-incorporated-test && aws --profile sinister-incorporated-test --region eu-central-1 ssm put-parameter --name /email-function/mailgun-api-key --value foobar --type SecureString --overwrite`
   2. `aws sso login --profile sinister-incorporated-test && aws --profile sinister-incorporated-test --region eu-central-1 ssm put-parameter --name /email-function/api-key --value foobar --type SecureString --overwrite`

5. Create and populate `test.s3.tfbackend`, `prod.s3.tfbackend`, `test.tfvars` and `prod.tfvars`
6. `cd email-function && npm run build:lambda`
7. Create Terraform resources

   1. `terraform init -backend-config=test.s3.tfbackend`
   2. `aws sso login --profile sinister-incorporated-test && terraform apply -var-file="test.tfvars"`

## 3. Set up Vercel
