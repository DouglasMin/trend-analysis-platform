#!/bin/bash

# Automated Lambda deployment via ECR + Docker
set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration (defaults align with this project)
AWS_PROFILE="${AWS_PROFILE:-dongik2}"
AWS_REGION="${AWS_REGION:-ap-northeast-2}"
AWS_ACCOUNT_ID="${AWS_ACCOUNT_ID:-863518440691}"
ECR_REPOSITORY="${ECR_REPOSITORY:-trend-analysis-lambda}"
LAMBDA_PREFIX="${LAMBDA_PREFIX:-trend-analysis-dev-}"

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKEND_DIR="$ROOT_DIR/backend"
ECR_REGISTRY="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"
ECR_URI="${ECR_REGISTRY}/${ECR_REPOSITORY}"
TIMESTAMP="$(date +%s)"

echo -e "${YELLOW}🚀 Starting backend deployment...${NC}\n"

echo -e "${YELLOW}🔐 Logging into ECR...${NC}"
aws ecr get-login-password --region "$AWS_REGION" --profile "$AWS_PROFILE" | \
  docker login --username AWS --password-stdin "$ECR_REGISTRY" >/dev/null
echo -e "${GREEN}✓ ECR login OK${NC}\n"

echo -e "${YELLOW}📦 Building and pushing linux/amd64 image...${NC}"
cd "$BACKEND_DIR"
docker buildx build --platform linux/amd64 --provenance=false \
  -t "${ECR_URI}:latest" \
  -t "${ECR_URI}:${TIMESTAMP}" \
  --push .
echo -e "${GREEN}✓ Image pushed to ECR${NC}\n"

echo -e "${YELLOW}🔄 Updating Lambda functions with latest image...${NC}"
FUNCTIONS="$(aws lambda list-functions \
  --region "$AWS_REGION" \
  --profile "$AWS_PROFILE" \
  --query "Functions[?starts_with(FunctionName, \`${LAMBDA_PREFIX}\`)].FunctionName" \
  --output text)"

if [ -z "$FUNCTIONS" ]; then
  echo -e "${RED}No Lambda functions found with prefix: ${LAMBDA_PREFIX}${NC}"
  exit 1
fi

for fn in $FUNCTIONS; do
  aws lambda update-function-code \
    --function-name "$fn" \
    --image-uri "${ECR_URI}:latest" \
    --region "$AWS_REGION" \
    --profile "$AWS_PROFILE" >/dev/null
done

for fn in $FUNCTIONS; do
  aws lambda wait function-updated \
    --function-name "$fn" \
    --region "$AWS_REGION" \
    --profile "$AWS_PROFILE"
done

echo -e "${GREEN}✅ Backend deployment complete!${NC}"
echo -e "Image: ${YELLOW}${ECR_URI}:latest${NC}"
echo -e "Functions: ${YELLOW}${FUNCTIONS}${NC}\n"
