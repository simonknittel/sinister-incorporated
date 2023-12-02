# Setup Test and Production

## 1. Set up PlanetScale

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

3. Create a Amazon S3 bucket for Terraform backends

   1. `aws sso login --profile sinister-incorporated-test && aws --profile sinister-incorporated-test --region eu-central-1 s3api create-bucket --bucket terraform-backend-aowb47tawo48wvt4 --create-bucket-configuration LocationConstraint=eu-central-1 --object-ownership BucketOwnerEnforced`
      1. Make sure to use a globally unique bucket name
   2. `aws sso login --profile sinister-incorporated-prod && aws --profile sinister-incorporated-prod --region eu-central-1 s3api create-bucket --bucket terraform-backend-awvb4oa8tv7nao48 --create-bucket-configuration LocationConstraint=eu-central-1 --object-ownership BucketOwnerEnforced`
      1. Make sure to use a globally unique bucket name

4. Create and populate `test.s3.tfbackend`, `prod.s3.tfbackend`, `test.tfvars` and `prod.tfvars`
5. `cd email-function && npm run build:lambda`
6. Create Terraform resources

   1. `terraform init -backend-config=test.s3.tfbackend`
   2. `aws sso login --profile sinister-incorporated-test && terraform apply -var-file="test.tfvars"`
   3. `terraform init -backend-config=prod.s3.tfbackend`
   4. `aws sso login --profile sinister-incorporated-prod && terraform apply -var-file="prod.tfvars"`

## 3. Set up Vercel
