# Deployment Scripts

This directory contains scripts for deploying the Web Trend Analysis Platform.

## Backend Deployment

### Quick Deploy

To deploy backend changes to AWS Lambda:

```bash
./scripts/deploy-backend.sh
```

This script will:
1. ✅ Login to AWS ECR
2. ✅ Build Docker image
3. ✅ Tag image with `latest` and timestamp
4. ✅ Push image to ECR
5. ✅ Update Lambda functions to use new image
6. ✅ Wait for Lambda update to complete

### Environment Variables

The script uses these environment variables (with defaults):

```bash
AWS_REGION=ap-northeast-2         # AWS region
AWS_PROFILE=dongik2               # AWS CLI profile
AWS_ACCOUNT_ID=863518440691       # AWS account ID
ECR_REPOSITORY=trend-analysis-lambda  # ECR repository name
LAMBDA_PREFIX=trend-analysis-dev- # Lambda function name prefix
```

You can override them:

```bash
LAMBDA_PREFIX=trend-analysis-prod- ./scripts/deploy-backend.sh
```

### Prerequisites

Before running the deployment script:

1. **AWS CLI configured** with `dongik2` profile:
   ```bash
   aws configure --profile dongik2
   ```

2. **Docker installed** and running

3. **ECR repository created** (via Terraform):
   ```bash
   cd infrastructure
   terraform apply
   ```

4. **Lambda functions created** (via Terraform)

### Manual Deployment Steps

If you prefer manual deployment:

```bash
# 1. Login to ECR
aws ecr get-login-password --region ap-northeast-2 --profile dongik2 | \
  docker login --username AWS --password-stdin 863518440691.dkr.ecr.ap-northeast-2.amazonaws.com

# 2. Build and push docker image
cd backend
docker buildx build --platform linux/amd64 --provenance=false \
  -t 863518440691.dkr.ecr.ap-northeast-2.amazonaws.com/trend-analysis-lambda:latest \
  --push .

# 3. Update all Lambda functions in the project
aws lambda list-functions \
  --region ap-northeast-2 \
  --profile dongik2 \
  --query "Functions[?starts_with(FunctionName, \`trend-analysis-dev-\`)].FunctionName" \
  --output text | tr '\t' '\n' | while read -r fn; do
  aws lambda update-function-code \
    --function-name "$fn" \
    --image-uri 863518440691.dkr.ecr.ap-northeast-2.amazonaws.com/trend-analysis-lambda:latest \
    --region ap-northeast-2 \
    --profile dongik2
done
```

## Frontend Deployment

Frontend deployment script will be created in later tasks.

## Full Deployment

Full deployment script (infrastructure + backend + frontend) will be created in later tasks.

## Troubleshooting

### Docker Login Issues

```bash
# Verify AWS credentials
aws sts get-caller-identity --profile dongik2

# Should return account ID: 863518440691
```

### ECR Repository Not Found

```bash
# Create ECR repository via Terraform
cd infrastructure
terraform apply -target=aws_ecr_repository.lambda
```

### Lambda Update Fails

```bash
# Check Lambda functions exist
aws lambda list-functions --profile dongik2 --region ap-northeast-2 | rg trend-analysis-dev-

# Check Lambda execution role has ECR permissions
```

### Build Fails

```bash
# Clean and rebuild
cd backend
rm -rf dist node_modules
npm install
npm run build
```

## CI/CD

GitHub Actions workflows will automate these deployments:
- `.github/workflows/backend-deploy.yml` - Auto-deploy on push to main
- `.github/workflows/frontend-deploy.yml` - Auto-deploy frontend
- `.github/workflows/infrastructure-deploy.yml` - Terraform changes

## Notes

- **Image Tags**: Each deployment creates two tags:
  - `latest` - Always points to most recent deployment
  - `YYYYMMDD-HHMMSS` - Timestamp for rollback capability

- **Lambda Cold Starts**: First invocation after deployment may be slower (cold start)

- **Rollback**: To rollback to a previous version:
  ```bash
  aws lambda update-function-code \
    --function-name trend-analysis-dev \
    --image-uri 863518440691.dkr.ecr.ap-northeast-2.amazonaws.com/trend-analysis-lambda:20240103-143022 \
    --region ap-northeast-2 \
    --profile dongik2
  ```

- **Environment Variables**: Lambda environment variables are managed via Terraform, not in the Docker image
