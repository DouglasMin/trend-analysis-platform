# Web Trend Analysis Platform

A comprehensive web trend analysis platform that leverages SerpAPI to aggregate and analyze trends across multiple data sources including Google Trends, Shopping, News, and real-time searches.

## Overview

This platform provides unified trend insights for market research, content strategy, and business intelligence. It consists of:
- **Frontend**: React + TypeScript + Vite application with shadcn/ui components
- **Backend**: AWS Lambda functions (Node.js 22 + TypeScript) with Docker
- **Infrastructure**: Terraform-managed AWS resources (API Gateway, DynamoDB, ECR, CloudFront)

## Technology Stack

### Frontend
- React 18+ with TypeScript
- Vite for build tooling
- Zustand for state management
- shadcn/ui (Tailwind CSS + Radix UI)
- Recharts for data visualization

### Backend
- Node.js 22 with TypeScript
- AWS Lambda (containerized with Docker)
- DynamoDB for caching
- API Gateway for REST API

### Infrastructure
- Terraform for IaC
- AWS ECR for container registry
- AWS S3 + CloudFront for frontend hosting
- AWS CloudWatch for logging

## Project Structure

```
web-trend-analysis-platform/
├── frontend/           # React frontend application
├── backend/            # AWS Lambda backend
├── infrastructure/     # Terraform configuration
├── scripts/            # Deployment scripts
└── .github/workflows/  # CI/CD workflows
```

## Environment Variables

### Backend (.env)

Copy `backend/.env.example` to `backend/.env` and configure:

```bash
# SerpAPI Configuration
SERPAPI_KEY=your_serpapi_key_here

# AWS Configuration
AWS_REGION=us-east-1
AWS_PROFILE=dongik2
AWS_ACCOUNT_ID=863518440691

# DynamoDB Configuration
DYNAMODB_TABLE_NAME=trend-analysis-cache

# Lambda Configuration
LAMBDA_TIMEOUT=30
LAMBDA_MEMORY=512

# Environment
NODE_ENV=development
```

**Required Variables:**
- `SERPAPI_KEY`: Your SerpAPI key from https://serpapi.com/
- `AWS_PROFILE`: AWS CLI profile name (dongik2)
- `AWS_ACCOUNT_ID`: AWS account ID (863518440691)
- `DYNAMODB_TABLE_NAME`: DynamoDB table name for caching

### Frontend (.env)

Copy `frontend/.env.example` to `frontend/.env` and configure:

```bash
# Backend API Configuration
VITE_BACKEND_API_URL=http://localhost:3000

# Environment
VITE_ENV=development
```

**Required Variables:**
- `VITE_BACKEND_API_URL`: Backend API endpoint URL

**Note**: All SerpAPI calls should be proxied through the backend to keep the API key secure.

## Getting Started

### Prerequisites

- Node.js 22+
- npm or yarn
- AWS CLI configured with `dongik2` profile
- Terraform 1.0+
- Docker (for backend deployment)
- SerpAPI account and API key

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd web-trend-analysis-platform
```

2. Install frontend dependencies:
```bash
cd frontend
npm install
```

3. Install backend dependencies:
```bash
cd backend
npm install
```

4. Configure environment variables:
```bash
# Backend
cp backend/.env.example backend/.env
# Edit backend/.env with your configuration

# Frontend
cp frontend/.env.example frontend/.env
# Edit frontend/.env with your configuration
```

### Development

#### Frontend Development Server
```bash
cd frontend
npm run dev
```

#### Backend Development
```bash
cd backend
npm run dev
```

#### Linting and Formatting
```bash
# Frontend
cd frontend
npm run lint        # Check for linting errors
npm run lint:fix    # Fix linting errors
npm run format      # Format code with Prettier

# Backend
cd backend
npm run lint        # Check for linting errors
npm run lint:fix    # Fix linting errors
npm run format      # Format code with Prettier
```

## Features

- Analyze Google Trends data (interest over time, regional distribution, related insights)
- Monitor real-time trending searches
- Track news trends and media coverage
- Analyze shopping and product trends
- Generate unified reports combining multiple data sources
- Visualize trends with interactive charts
- Export data in multiple formats (JSON, CSV)

## Usage

Coming soon...

## Deployment

Deployment instructions will be added after infrastructure setup is complete.

## Contributing

Feel free to contribute by submitting pull requests or reporting issues.

## License

This project is licensed under the MIT License.
