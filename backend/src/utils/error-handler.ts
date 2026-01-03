import type { APIGatewayProxyResult } from 'aws-lambda';

import {
  CacheError,
  ConfigurationError,
  NetworkError,
  RateLimitError,
  SerpAPIError,
  ValidationError,
} from '../types/index.js';

import { CORS_HEADERS } from '../handlers/http.js';

export function handleError(error: unknown): APIGatewayProxyResult {
  if (error instanceof ValidationError) {
    return buildErrorResponse(400, error.message, error.details);
  }
  if (error instanceof RateLimitError) {
    return buildErrorResponse(429, error.message, error.responseBody);
  }
  if (error instanceof SerpAPIError) {
    const statusCode = error.statusCode ?? 502;
    return buildErrorResponse(statusCode, error.message, error.responseBody);
  }
  if (error instanceof NetworkError) {
    return buildErrorResponse(502, error.message);
  }
  if (error instanceof ConfigurationError) {
    return buildErrorResponse(500, error.message);
  }
  if (error instanceof CacheError) {
    return buildErrorResponse(500, error.message);
  }

  const message = error instanceof Error ? error.message : 'Unexpected error';
  return buildErrorResponse(500, message);
}

function buildErrorResponse(
  statusCode: number,
  message: string,
  details?: unknown,
): APIGatewayProxyResult {
  const payload: Record<string, unknown> = {
    error: message,
  };
  if (details !== undefined) {
    payload.details = details;
  }
  return {
    statusCode,
    headers: CORS_HEADERS,
    body: JSON.stringify(payload),
  };
}
