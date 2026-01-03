import {
  ConfigurationError,
  NetworkError,
  RateLimitError,
  SerpAPIError,
  ValidationError,
  type SearchParams,
} from '../types/index.js';

type SerpAPIOutput = 'json' | 'html';

export interface SerpAPIClientOptions {
  apiKey?: string;
  baseUrl?: string;
  timeoutMs?: number;
  fetchFn?: typeof fetch;
}

export interface SerpAPIRequestOptions {
  noCache?: boolean;
  async?: boolean;
  output?: SerpAPIOutput;
}

const DEFAULT_BASE_URL = 'https://serpapi.com/search.json';
const DEFAULT_TIMEOUT_MS = 30_000;
const RATE_LIMIT_BACKOFF_MS = [1000, 2000, 4000];
const MAX_NETWORK_RETRIES = 3;

export class SerpAPIClient {
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly timeoutMs: number;
  private readonly fetchFn: typeof fetch;

  constructor(options: SerpAPIClientOptions = {}) {
    const apiKey = options.apiKey ?? process.env.SERPAPI_KEY;
    if (!apiKey) {
      throw new ConfigurationError('SERPAPI_KEY is required');
    }

    this.apiKey = apiKey;
    this.baseUrl = options.baseUrl ?? DEFAULT_BASE_URL;
    this.timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
    this.fetchFn = options.fetchFn ?? fetch;
  }

  async search<T>(params: SearchParams, options: SerpAPIRequestOptions = {}): Promise<T> {
    this.validateParams(params);
    this.validateRequestOptions(options);

    const requestParams: Record<string, string> = {
      ...this.serializeParams(params),
      api_key: this.apiKey,
    };

    if (options.noCache !== undefined) {
      requestParams.no_cache = String(options.noCache);
    }
    if (options.async !== undefined) {
      requestParams.async = String(options.async);
    }
    if (options.output) {
      requestParams.output = options.output;
    }

    return this.executeWithRetry<T>(requestParams, options.output);
  }

  private validateRequestOptions(options: SerpAPIRequestOptions): void {
    if (options.noCache && options.async) {
      throw new ValidationError('no_cache and async cannot be used together');
    }
  }

  private validateParams(params: SearchParams): void {
    if (!params.engine) {
      throw new ValidationError('engine is required');
    }

    switch (params.engine) {
      case 'google_trends':
        if (!params.q) {
          throw new ValidationError('q is required for google_trends');
        }
        if (!params.data_type) {
          throw new ValidationError('data_type is required for google_trends');
        }
        break;
      case 'google':
        if (!params.q) {
          throw new ValidationError('q is required for google');
        }
        if (params.tbm !== 'nws') {
          throw new ValidationError('tbm=nws is required for news searches');
        }
        break;
      case 'google_shopping':
        if (!params.q) {
          throw new ValidationError('q is required for google_shopping');
        }
        break;
      case 'google_trends_trending_now':
      case 'google_trends_news':
        break;
      default: {
        const engine = (params as { engine?: string }).engine;
        throw new ValidationError(`Unsupported engine: ${engine ?? 'unknown'}`);
      }
    }
  }

  private serializeParams(params: SearchParams): Record<string, string> {
    const serialized: Record<string, string> = {};
    for (const [key, value] of Object.entries(params)) {
      if (value === undefined || value === null) continue;
      serialized[key] = String(value);
    }
    return serialized;
  }

  private async executeWithRetry<T>(
    requestParams: Record<string, string>,
    output?: SerpAPIOutput,
  ): Promise<T> {
    let networkRetries = 0;
    let rateLimitRetries = 0;

    for (;;) {
      try {
        return await this.executeOnce<T>(requestParams, output);
      } catch (error) {
        if (error instanceof RateLimitError && rateLimitRetries < RATE_LIMIT_BACKOFF_MS.length) {
          const delayMs = RATE_LIMIT_BACKOFF_MS[rateLimitRetries];
          rateLimitRetries += 1;
          await this.delay(delayMs);
          continue;
        }

        if (error instanceof NetworkError && networkRetries < MAX_NETWORK_RETRIES) {
          networkRetries += 1;
          continue;
        }

        throw error;
      }
    }
  }

  private async executeOnce<T>(
    requestParams: Record<string, string>,
    output?: SerpAPIOutput,
  ): Promise<T> {
    const url = new URL(this.baseUrl);
    url.search = new URLSearchParams(requestParams).toString();

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await this.fetchFn(url.toString(), { signal: controller.signal });
      const payload = await response.text();
      const data = this.parsePayload(payload, output);

      if (!response.ok) {
        this.throwResponseError(response.status, data);
      }

      return data as T;
    } catch (error) {
      if (error instanceof SerpAPIError) {
        throw error;
      }
      if (error instanceof Error && error.name === 'AbortError') {
        throw new NetworkError('Request timed out', error);
      }
      throw new NetworkError('Network request failed', error);
    } finally {
      clearTimeout(timeout);
    }
  }

  private parsePayload(payload: string, output?: SerpAPIOutput): unknown {
    if (output === 'html') {
      return payload;
    }
    if (!payload) {
      return {};
    }
    try {
      return JSON.parse(payload);
    } catch {
      return payload;
    }
  }

  private throwResponseError(status: number, data: unknown): never {
    const message = this.extractErrorMessage(data) ?? `SerpAPI request failed with ${status}`;
    if (status === 429 || /rate limit/i.test(message)) {
      throw new RateLimitError(message, status, data);
    }
    throw new SerpAPIError(message, status, data);
  }

  private extractErrorMessage(data: unknown): string | undefined {
    if (!data) return undefined;
    if (typeof data === 'string') return data;
    if (typeof data === 'object' && data !== null && 'error' in data) {
      const value = (data as { error?: unknown }).error;
      if (typeof value === 'string') return value;
    }
    return undefined;
  }

  private async delay(ms: number): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, ms));
  }
}
