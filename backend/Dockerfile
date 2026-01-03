# Build stage
FROM public.ecr.aws/lambda/nodejs:22 AS build

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# Runtime stage
FROM public.ecr.aws/lambda/nodejs:22

WORKDIR /var/task
COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=build /app/dist ./

# Default handler can be overridden per Lambda configuration
CMD [ "index.interestOverTimeHandler" ]
