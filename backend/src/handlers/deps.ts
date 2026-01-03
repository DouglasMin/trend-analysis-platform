import { DynamoDBClient, type DynamoDBClientConfig } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

import { DynamoDBService } from '../services/dynamodb-service.js';
import { SerpAPIClient } from '../services/serpapi-client.js';

export interface HandlerDependencies {
  serpapi: SerpAPIClient;
  cache: DynamoDBService;
}

export function createDefaultDependencies(): HandlerDependencies {
  const config: DynamoDBClientConfig = {};
  if (process.env.AWS_REGION) {
    config.region = process.env.AWS_REGION;
  }
  if (process.env.DYNAMODB_ENDPOINT) {
    config.endpoint = process.env.DYNAMODB_ENDPOINT;
  }
  const documentClient = DynamoDBDocumentClient.from(new DynamoDBClient(config), {
    marshallOptions: {
      removeUndefinedValues: true,
    },
  });
  return {
    serpapi: new SerpAPIClient(),
    cache: new DynamoDBService({ documentClient }),
  };
}
