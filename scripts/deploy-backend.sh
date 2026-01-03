#!/bin/bash

# Exit on error
set -e

echo "🚀 Starting backend deployment..."

# Configuration
AWS_REGION="${AWS_REGION:-us-east-1}"
AWS_PROFILE="${AWS_PROFILE:-dongik2}"
AWS_ACCOUNT_ID="${AWS_ACCOUNT_ID:-863518440691}"
ECR_REPOSITORY="${ECR_REPOSITORY:-trend-analysis-lambda}"
LAMBDA_FUNCTION_NAME="${LAMBDA_FUNCTION_NAME:-trend-analysis-dev}"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}📦 Building TypeScript code...${NC}"
cd backend
npm run build

echo -e "${BLUE}🔐 Logging into ECR...${NC}"
aws ecr get-login-password --region $AWS_REGION --profile $AWS_PROFILE | \
  docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com

# Get ECR repository URI
ECR_URI="$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPOSITORY"

echo -e "${BLUE}🐳 Building Docker image...${NC}"
docker build -t $ECR_REPOSITORY:latest .

echo -e "${BLUE}🏷️  Tagging Docker image...${NC}"
docker tag $ECR_REPOSITORY:latest $ECR_URI:latest
docker tag $ECR_REPOSITORY:latest $ECR_URI:$(date +%Y%m%d-%H%M%S)

echo -e "${BLUE}⬆️  Pushing Docker image to ECR...${NC}"
docker push $ECR_URI:latest
docker push $ECR_URI:$(date +%Y%m%d-%H%M%S)

echo -e "${BLUE}🔄 Updating Lambda function...${NC}"
aws lambda update-function-code \
  --function-name $LAMBDA_FUNCTION_NAME \
  --image-uri $ECR_URI:latest \
  --region $AWS_REGION \
  --profile $AWS_PROFILE

echo -e "${BLUE}⏳ Waiting for Lambda update to complete...${NC}"
aws lambda wait function-updated \
  --function-name $LAMBDA_FUNCTION_NAME \
  --region $AWS_REGION \
  --profile $AWS_PROFILE

echo -e "${GREEN}✅ Backend deployment complete!${NC}"
echo -e "${GREEN}Lambda function: $LAMBDA_FUNCTION_NAME${NC}"
echo -e "${GREEN}Image: $ECR_URI:latest${NC}"

cd ..
