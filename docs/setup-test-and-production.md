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
3. Enable "Allow GitHub Actions to create and approve pull requests" in Settings/Actions/General/Workflow permissions

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

   # Sinister Incorporated
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

   1. `AWS_PROFILE=sinister-incorporated-test aws sso login`
   2. `AWS_PROFILE=sinister-incorporated-test aws --region eu-central-1 cloudformation deploy --template-file ./cloudformation/setup.yaml --stack-name setup --capabilities CAPABILITY_IAM CAPABILITY_NAMED_IAM --tags ManagedBy=CloudFormation Repository=simonknittel/sinister-incorporated CloudFormationStack=setup`

4. Create parameters in AWS System Manager (make sure to replace `foobar` with the actual values)

   1. `AWS_PROFILE=sinister-incorporated-test aws sso login`
   2. `AWS_PROFILE=sinister-incorporated-test aws --region eu-central-1 ssm put-parameter --name /email-function/mailgun-api-key --value foobar --type SecureString --overwrite`
   3. `AWS_PROFILE=sinister-incorporated-test aws --region eu-central-1 ssm put-parameter --name /email-function/api-key --value foobar --type SecureString --overwrite`

5. Manually set up AWS User Notifications through the console

   1. Notification hubs: eu-central-1
   2. Create notification configuration for CloudWatch

      1. Name: `cloudwatch-alarms`
      2. AWS service name: `CloudWatch`
      3. Event type: `CloudWatch Alarm State Change`
      4. Regions: eu-central-1
      5. Advanced filter

      ```json
      {
        "detail": {
          "previousState": { "value": ["OK", "INSUFFICIENT_DATA"] },
          "state": { "value": ["ALARM"] }
        }
      }
      ```

      6. Aggregation settings: Receive within 5 minutes
      7. Delivery channels: Email

   3. Create notification configuration for Health

### Related

- https://stackoverflow.com/questions/51273227/whats-the-most-efficient-way-to-determine-the-minimum-aws-permissions-necessary
- https://github.com/iann0036/iamlive
  - `iamlive --mode proxy --force-wildcard-resource --output-file policy.json --sort-alphabetical`
  - `HTTP_PROXY=http://127.0.0.1:10080 HTTPS_PROXY=http://127.0.0.1:10080 AWS_CA_BUNDLE=~/.iamlive/ca.pem AWS_CSM_ENABLED=true AWS_PROFILE=sinister-incorporated-test terraform plan -var-file="test.tfvars"`

## 5. Prepare certificates for Mutual TLS (mTLS)

1. `mkdir certificates && cd certificates/`
2. Create private certificate authority (CA): `openssl genrsa -out RootCA.key 4096`
3. Create private and public keys: `openssl req -new -x509 -days 3650 -key RootCA.key -out RootCA.pem`
   - Country Name: `DE`
   - State or Province Name: `Lower Saxony`
   - Locality Name: `Delmenhorst`
   - Organization Name: `Sinister Incorporated`
   - Organizational Unit Name: `-`
   - Common Name: `sinister-api.simonknittel.de`
   - Email Address: `-`
4. Create client certificate private key and certificate signing request (CSR). Leave _A challenge password_ empty.
   1. `openssl req -newkey rsa:2048 -nodes -keyout localhost.key -out localhost.csr`
   2. `openssl req -newkey rsa:2048 -nodes -keyout vercel.key -out vercel.csr`
5. Sign client certificates with root CA
   1. `openssl x509 -req -in localhost.csr -CA RootCA.pem -CAkey RootCA.key -set_serial 01 -out localhost.pem -days 3650 -sha256`
   2. `openssl x509 -req -in vercel.csr -CA RootCA.pem -CAkey RootCA.key -set_serial 01 -out vercel.pem -days 3650 -sha256`
6. Create trust store: `cp RootCA.pem truststore.pem`

## 6. Set up Terraform

1. Create and populate `test.s3.tfbackend`, `prod.s3.tfbackend`, `test.tfvars` and `prod.tfvars`
2. `cd bun-packages/ && bun install --frozen-lockfile && cd packages/email-function/ && bun run build:lambda`
3. Create Terraform resources

   1. `AWS_PROFILE=sinister-incorporated-test aws sso login`
   2. `AWS_PROFILE=sinister-incorporated-test terraform init -backend-config=test.s3.tfbackend`
   3. `AWS_PROFILE=sinister-incorporated-test terraform apply -var-file="test.tfvars"`

## 7. Set up Vercel

1. Set `Ignored Build Step` to `Run my Bash script: bash ../.vercel/ignore-step.sh`


## 8. Left over

1. Manually enable we monthly budget report on AWS
   - Budget report name: `Total monthly costs`
   - Select budgets: `Total monthly budget`
   - Report frequency: `Monthly`
   - Day of month: `1`
