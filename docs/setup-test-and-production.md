# Setup Test and Production

## 1. Set up PlanetScale

## 2. Set up Mailgun

1. Create API keys for sending

   1. `sinister-incorporated-aws-test`
   2. `sinister-incorporated-aws-prod`

## 3. Set up GitHub

1. `gh auth login`
2. `gh api --method PUT -H "Accept: application/vnd.github+json" -H "X-GitHub-Api-Version: 2022-11-28" /repos/simonknittel/sinister-incorporated/actions/oidc/customization/sub -F use_default=false -f "include_claim_keys[]=repo" -f "include_claim_keys[]=job_workflow_ref"`
   1. `gh api -H "Accept: application/vnd.github+json" -H "X-GitHub-Api-Version: 2022-11-28" /repos/simonknittel/sinister-incorporated/actions/oidc/customization/sub`

### Related

- https://docs.github.com/en/actions/deployment/security-hardening-your-deployments/about-security-hardening-with-openid-connect#customizing-the-token-claims
- https://docs.github.com/en/rest/actions/oidc?apiVersion=2022-11-28#set-the-customization-template-for-an-oidc-subject-claim-for-a-repository

## 4. Set up AWS

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

3. Create and deploy setup stack with AWS CloudFormation

   1. `aws sso login --profile sinister-incorporated-test`
   2. `aws --profile sinister-incorporated-test --region eu-central-1 cloudformation deploy --template-file ./cloudformation/setup.yaml --stack-name setup --capabilities CAPABILITY_IAM CAPABILITY_NAMED_IAM --tags ManagedBy=CloudFormation Repository=simonknittel/sinister-incorporated CloudFormationStack=setup`

4. Create parameters in AWS System Manager (make sure to replace `foobar` with the actual values)

   1. `aws sso login --profile sinister-incorporated-test`
   2. `aws --profile sinister-incorporated-test --region eu-central-1 ssm put-parameter --name /email-function/mailgun-api-key --value foobar --type SecureString --overwrite`
   3. `aws --profile sinister-incorporated-test --region eu-central-1 ssm put-parameter --name /email-function/api-key --value foobar --type SecureString --overwrite`

### Related

- https://stackoverflow.com/questions/51273227/whats-the-most-efficient-way-to-determine-the-minimum-aws-permissions-necessary
- https://github.com/iann0036/iamlive
  - `iamlive --mode proxy --force-wildcard-resource --output-file policy.json`
  - `HTTP_PROXY=http://127.0.0.1:10080 HTTPS_PROXY=http://127.0.0.1:10080 AWS_CA_BUNDLE=~/.iamlive/ca.pem AWS_CSM_ENABLED=true AWS_PROFILE=sinister-incorporated-test terraform plan -var-file="test.tfvars"`

## 5. Set up Terraform

1. Create and populate `test.s3.tfbackend`, `prod.s3.tfbackend`, `test.tfvars` and `prod.tfvars`
2. `cd email-function && npm run build:lambda`
3. Create Terraform resources

   1. `aws sso login --profile sinister-incorporated-test`
   2. `AWS_PROFILE=sinister-incorporated-test terraform init -backend-config=test.s3.tfbackend`
   3. `AWS_PROFILE=sinister-incorporated-test terraform apply -var-file="test.tfvars"`

## 6. Set up Vercel
