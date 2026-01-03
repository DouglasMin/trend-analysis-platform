# Deployment Scripts

This directory contains scripts for deploying the Web Trend Analysis Platform.

## Backend Deployment

### Quick Deploy

To deploy backend changes to AWS Lambda:

```bash
./scripts/deploy-backend.sh
```

This script will:
1. ✅ Build TypeScript code (`npm run build`)
2. ✅ Login to AWS ECR
3. ✅ Build Docker image
4. ✅ Tag image with `latest` and timestamp
5. ✅ Push image to ECR
6. ✅ Update Lambda function to use new image
7. ✅ Wait for Lambda update to complete

### Environment Variables

The script uses these environment variables (with defaults):

```bash
AWS_REGION=us-east-1              # AWS region
AWS_PROFILE=dongik2               # AWS CLI profile
AWS_ACCOUNT_ID=863518440691       # AWS account ID
ECR_REPOSITORY=trend-analysis-lambda  # ECR repository name
LAMBDA_FUNCTION_NAME=trend-analysis-dev  # Lambda function name
```

You can override them:

```bash
LAMBDA_FUNCTION_NAME=trend-analysis-prod ./scripts/deploy-backend.sh
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

4. **Lambda function created** (via Terraform)

5. **Backend built successfully**:
   ```bash
   cd backend
   npm run build
   ```

### Manual Deployment Steps

If you prefer manual deployment:

```bash
# 1. Build TypeScript
cd backend
npm run build

# 2. Login to ECR
aws ecr get-login-password --region us-east-1 --profile dongik2 | \
  docker login --username AWS --password-stdin 863518440691.dkr.ecr.us-east-1.amazonaws.com

# 3. Build Docker image
docker build -t trend-analysis-lambda:latest .

# 4. Tag image
docker tag trend-analysis-lambda:latest \
  863518440691.dkr.ecr.us-east-1.amazonaws.com/trend-analysis-lambda:latest

# 5. Push to ECR
docker push 863518440691.dkr.ecr.us-east-1.amazonaws.com/trend-analysis-lambda:latest

# 6. Update Lambda
aws lambda update-function-code \
  --function-name trend-analysis-dev \
  --image-uri 863518440691.dkr.ecr.us-east-1.amazonaws.com/trend-analysis-lambda:latest \
  --region us-east-1 \
  --profile dongik2
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
# Check Lambda function exists
aws lambda get-function --function-name trend-analysis-dev --profile dongik2

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
    --image-uri 863518440691.dkr.ecr.us-east-1.amazonaws.com/trend-analysis-lambda:20240103-143022 \
    --region us-east-1 \
    --profile dongik2
  ```

- **Environment Variables**: Lambda environment variables are managed via Terraform, not in the Docker image
