export class ValidationError extends Error {
  readonly details?: string;

  constructor(message: string, details?: string) {
    super(message);
    this.name = 'ValidationError';
    this.details = details;
  }
}

export class ConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ConfigurationError';
  }
}

export class SerpAPIError extends Error {
  readonly statusCode?: number;
  readonly responseBody?: unknown;

  constructor(message: string, statusCode?: number, responseBody?: unknown) {
    super(message);
    this.name = 'SerpAPIError';
    this.statusCode = statusCode;
    this.responseBody = responseBody;
  }
}

export class RateLimitError extends SerpAPIError {
  constructor(message: string, statusCode?: number, responseBody?: unknown) {
    super(message, statusCode, responseBody);
    this.name = 'RateLimitError';
  }
}

export class NetworkError extends Error {
  readonly cause?: unknown;

  constructor(message: string, cause?: unknown) {
    super(message);
    this.name = 'NetworkError';
    this.cause = cause;
  }
}

export class CacheError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CacheError';
  }
}
