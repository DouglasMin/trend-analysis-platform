# Backend - Web Trend Analysis Platform

AWS Lambda backend for the Web Trend Analysis Platform, built with Node.js 22 and TypeScript.

## Architecture

- **Runtime**: Node.js 22
- **Platform**: AWS Lambda (containerized with Docker)
- **API**: REST API via API Gateway
- **Database**: DynamoDB (for caching)
- **Container Registry**: AWS ECR

## Project Structure

```
backend/
├── src/
│   ├── handlers/       # Lambda function handlers
│   ├── services/       # Business logic services
│   │   ├── serpapi-client.ts
│   │   ├── data-aggregator.ts
│   │   └── dynamodb-service.ts
│   ├── utils/          # Utility functions
│   │   ├── query-validator.ts
│   │   ├── error-handler.ts
│   │   └── cache-manager.ts
│   └── types/          # TypeScript type definitions
├── dist/               # Compiled JavaScript (gitignored)
├── Dockerfile          # Docker configuration for Lambda
├── .dockerignore       # Docker ignore patterns
├── package.json
├── tsconfig.json
└── eslint.config.js
```

## Setup

### Prerequisites

- Node.js 22+
- npm
- Docker (for deployment)
- AWS CLI configured with `dongik2` profile

### Installation

```bash
cd backend
npm install
```

### Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

Required variables:
- `SERPAPI_KEY` - Your SerpAPI key
- `AWS_REGION` - AWS region (default: us-east-1)
- `AWS_PROFILE` - AWS CLI profile (default: dongik2)
- `DYNAMODB_TABLE_NAME` - DynamoDB table name

## Development

### Build TypeScript

```bash
npm run build
```

### Watch Mode (auto-rebuild on changes)

```bash
npm run dev
```

### Linting

```bash
npm run lint          # Check for errors
npm run lint:fix      # Fix errors automatically
```

### Formatting

```bash
npm run format        # Format code
npm run format:check  # Check formatting
```

## Deployment

### Quick Deploy

From the project root:

```bash
./scripts/deploy-backend.sh
```

This will:
1. Build TypeScript code
2. Build Docker image
3. Push to ECR
4. Update Lambda function

### Manual Deploy

```bash
# 1. Build
npm run build

# 2. Build Docker image
docker build -t trend-analysis-lambda:latest .

# 3. Tag for ECR
docker tag trend-analysis-lambda:latest \
  863518440691.dkr.ecr.us-east-1.amazonaws.com/trend-analysis-lambda:latest

# 4. Login to ECR
aws ecr get-login-password --region us-east-1 --profile dongik2 | \
  docker login --username AWS --password-stdin 863518440691.dkr.ecr.us-east-1.amazonaws.com

# 5. Push to ECR
docker push 863518440691.dkr.ecr.us-east-1.amazonaws.com/trend-analysis-lambda:latest

# 6. Update Lambda
aws lambda update-function-code \
  --function-name trend-analysis-dev \
  --image-uri 863518440691.dkr.ecr.us-east-1.amazonaws.com/trend-analysis-lambda:latest \
  --region us-east-1 \
  --profile dongik2
```

## Docker

### Build Docker Image Locally

```bash
npm run build
docker build -t trend-analysis-lambda:latest .
```

### Test Docker Image Locally

```bash
# Run container
docker run -p 9000:8080 \
  -e SERPAPI_KEY=your_key \
  -e DYNAMODB_TABLE_NAME=trend-analysis-cache \
  trend-analysis-lambda:latest

# Test with curl (in another terminal)
curl -XPOST "http://localhost:9000/2015-03-31/functions/function/invocations" \
  -d '{"body": "{\"queries\": [\"test\"]}"}'
```

## Lambda Handlers

The backend exposes multiple Lambda handlers:

- `interestOverTimeHandler` - Google Trends interest over time
- `interestByRegionHandler` - Regional interest data
- `relatedQueriesHandler` - Related queries
- `relatedTopicsHandler` - Related topics
- `trendingNowHandler` - Real-time trending searches
- `newsTrendsHandler` - News trends
- `shoppingTrendsHandler` - Shopping trends
- `comprehensiveReportHandler` - Comprehensive reports

## API Gateway Integration

Lambda functions are exposed via API Gateway:

```
POST /trends/interest-over-time
POST /trends/interest-by-region
POST /trends/related-queries
POST /trends/related-topics
POST /trends/trending-now
POST /trends/news
POST /trends/shopping
POST /trends/comprehensive-report
```

## Caching

DynamoDB is used for caching API responses:

- **Trending Now**: 5 minutes TTL
- **News**: 30 minutes TTL
- **Trends**: 1 hour TTL
- **Shopping**: 1 hour TTL

## Error Handling

The backend implements comprehensive error handling:

- **ValidationError**: Invalid input parameters
- **APIError**: SerpAPI errors
- **NetworkError**: Network/timeout errors
- **CacheError**: DynamoDB errors

All errors return structured JSON responses with:
- `error`: Error type
- `message`: Human-readable message
- `suggestions`: Suggested fixes (for validation errors)

## Testing

Testing will be implemented in later tasks using:
- Vitest for unit tests
- fast-check for property-based tests

## Performance

- **Lambda Memory**: 512 MB (configurable)
- **Lambda Timeout**: 30 seconds (configurable)
- **Cold Start**: ~2-3 seconds (first invocation)
- **Warm Start**: ~100-200ms

## Monitoring

CloudWatch logs are automatically created for each Lambda invocation:

```bash
# View logs
aws logs tail /aws/lambda/trend-analysis-dev --follow --profile dongik2
```

## Troubleshooting

### Build Fails

```bash
rm -rf dist node_modules
npm install
npm run build
```

### Docker Build Fails

```bash
# Check Dockerfile syntax
docker build --no-cache -t trend-analysis-lambda:latest .
```

### Lambda Update Fails

```bash
# Verify Lambda exists
aws lambda get-function --function-name trend-analysis-dev --profile dongik2

# Check ECR image exists
aws ecr describe-images \
  --repository-name trend-analysis-lambda \
  --profile dongik2
```

## Next Steps

1. Implement Lambda handlers (Task 7)
2. Implement SerpAPI client (Task 3)
3. Implement DynamoDB service (Task 5)
4. Add comprehensive testing (Tasks 2-7)
