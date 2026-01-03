# Use AWS Lambda Node.js 22 base image
FROM public.ecr.aws/lambda/nodejs:22

# Copy package files
COPY package*.json ./

# Install production dependencies
RUN npm ci --only=production

# Copy source code
COPY dist/ ./dist/

# Copy any additional files needed at runtime
COPY .env* ./

# Set the CMD to your handler
CMD [ "dist/handlers/index.handler" ]
