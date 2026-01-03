# Infrastructure Configuration

This directory contains Terraform configuration for the Web Trend Analysis Platform infrastructure.

## Prerequisites

- Terraform >= 1.0
- AWS CLI configured with `dongik2` profile
- AWS account ID: 863518440691
- SerpAPI key

## AWS Resources

The Terraform configuration will create:

- **DynamoDB**: Table for caching API responses
- **ECR**: Container registry for Lambda Docker images
- **Lambda**: Serverless functions for backend API
- **API Gateway**: REST API endpoints
- **S3**: Bucket for frontend hosting
- **CloudFront**: CDN for frontend distribution
- **IAM**: Roles and policies for Lambda execution
- **CloudWatch**: Log groups for monitoring

## Setup

1. Copy the example variables file:
```bash
cp terraform.tfvars.example terraform.tfvars
```

2. Edit `terraform.tfvars` with your configuration:
```bash
# Required: Add your SerpAPI key
serpapi_key = "your_actual_serpapi_key"

# Optional: Customize other variables as needed
```

3. Initialize Terraform:
```bash
terraform init
```

4. Review the planned changes:
```bash
terraform plan
```

5. Apply the configuration:
```bash
terraform apply
```

## Configuration Files

- `main.tf`: Main Terraform configuration with provider setup
- `variables.tf`: Variable definitions
- `outputs.tf`: Output values after deployment
- `terraform.tfvars.example`: Example variables file
- `terraform.tfvars`: Your actual variables (gitignored)

## Resource Files (to be created)

- `dynamodb.tf`: DynamoDB table configuration
- `ecr.tf`: ECR repository configuration
- `lambda.tf`: Lambda function configuration
- `api-gateway.tf`: API Gateway configuration
- `s3-cloudfront.tf`: S3 and CloudFront configuration
- `iam.tf`: IAM roles and policies
- `cloudwatch.tf`: CloudWatch log groups

## State Management

The Terraform state is currently stored locally. For production use, configure remote state storage:

1. Create an S3 bucket for state storage
2. Create a DynamoDB table for state locking
3. Uncomment and configure the backend block in `main.tf`

## Usage

### Plan Changes
```bash
terraform plan
```

### Apply Changes
```bash
terraform apply
```

### Destroy Resources
```bash
terraform destroy
```

### View Outputs
```bash
terraform output
```

## AWS Profile

This configuration uses the AWS CLI profile `dongik2` for authentication. Ensure your AWS CLI is configured:

```bash
aws configure --profile dongik2
```

## Security Notes

- Never commit `terraform.tfvars` or any files containing secrets
- The `serpapi_key` variable is marked as sensitive
- Use AWS Secrets Manager or Parameter Store for production secrets
- Enable encryption for S3 buckets and DynamoDB tables

## Troubleshooting

### Authentication Issues
```bash
# Verify AWS profile
aws sts get-caller-identity --profile dongik2

# Should return account ID: 863518440691
```

### State Lock Issues
```bash
# Force unlock if needed (use with caution)
terraform force-unlock <lock-id>
```

## Next Steps

After infrastructure setup:
1. Build and push Docker image to ECR
2. Deploy Lambda function
3. Deploy frontend to S3
4. Configure custom domain (optional)
