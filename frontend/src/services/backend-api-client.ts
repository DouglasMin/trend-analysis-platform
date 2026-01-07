import { buildQueryString } from '@/utils/query';
import { isApiErrorResponse } from '@/types/api';
import type {
  ComprehensiveReportParams,
  GoogleTrendsParams,
  NewsTrendsParams,
  ShoppingTrendsParams,
  TrendingNowParams,
} from '@/types/params';
import type {
  NewsTrendsData,
  RegionalData,
  RelatedQueries,
  RelatedTopics,
  ShoppingTrendsData,
  TimeSeriesData,
  TrendReport,
  TrendingNowData,
} from '@/types/trend';

type RequestInterceptor = (
  url: string,
  init: RequestInit
) => Promise<{ url: string; init: RequestInit }> | { url: string; init: RequestInit };

type ResponseInterceptor = (response: Response) => Promise<Response> | Response;

export interface BackendApiClientOptions {
  baseUrl?: string;
  timeoutMs?: number;
  maxRetries?: number;
  retryDelayMs?: number;
}

function normalizeBaseUrl(baseUrl?: string): string {
  if (!baseUrl) return '';
  return baseUrl.replace(/\/$/, '');
}

async function safeJson(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return undefined;
  }
}

function shouldRetryStatus(status: number): boolean {
  return status === 429 || status >= 500;
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export class BackendAPIClient {
  private readonly baseUrl: string;
  private readonly timeoutMs: number;
  private readonly maxRetries: number;
  private readonly retryDelayMs: number;
  private readonly requestInterceptors: RequestInterceptor[] = [];
  private readonly responseInterceptors: ResponseInterceptor[] = [];

  constructor(options: BackendApiClientOptions = {}) {
    this.baseUrl = normalizeBaseUrl(options.baseUrl);
    this.timeoutMs = options.timeoutMs ?? 10000;
    this.maxRetries = options.maxRetries ?? 2;
    this.retryDelayMs = options.retryDelayMs ?? 500;
  }

  addRequestInterceptor(interceptor: RequestInterceptor): void {
    this.requestInterceptors.push(interceptor);
  }

  addResponseInterceptor(interceptor: ResponseInterceptor): void {
    this.responseInterceptors.push(interceptor);
  }

  async interestOverTime(params: GoogleTrendsParams): Promise<TimeSeriesData> {
    return this.request('/trends/interest-over-time', params);
  }

  async interestByRegion(params: GoogleTrendsParams): Promise<RegionalData> {
    return this.request('/trends/interest-by-region', params);
  }

  async comparedByRegion(params: GoogleTrendsParams): Promise<RegionalData> {
    return this.request('/trends/compared-by-region', params);
  }

  async relatedQueries(params: GoogleTrendsParams): Promise<RelatedQueries> {
    return this.request('/trends/related-queries', params);
  }

  async relatedTopics(params: GoogleTrendsParams): Promise<RelatedTopics> {
    return this.request('/trends/related-topics', params);
  }

  async trendingNow(params: TrendingNowParams): Promise<TrendingNowData> {
    return this.request('/trends/trending-now', params);
  }

  async newsTrends(params: NewsTrendsParams): Promise<NewsTrendsData> {
    return this.request('/trends/news', params);
  }

  async shoppingTrends(params: ShoppingTrendsParams): Promise<ShoppingTrendsData> {
    return this.request('/trends/shopping', params);
  }

  async comprehensiveReport(params: ComprehensiveReportParams): Promise<TrendReport> {
    return this.request('/trends/comprehensive-report', params);
  }

  private async request<T>(path: string, params: Record<string, unknown> | object): Promise<T> {
    const query = buildQueryString(params);
    const url = `${this.baseUrl}${path}${query ? `?${query}` : ''}`;
    let requestInit: RequestInit = {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    };

    let requestUrl = url;
    for (const interceptor of this.requestInterceptors) {
      const next = await interceptor(requestUrl, requestInit);
      requestUrl = next.url;
      requestInit = next.init;
    }

    let attempt = 0;
    while (true) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);
      try {
        const response = await fetch(requestUrl, {
          ...requestInit,
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        let processedResponse = response;
        for (const interceptor of this.responseInterceptors) {
          processedResponse = await interceptor(processedResponse);
        }

        if (!processedResponse.ok) {
          const payload = await safeJson(processedResponse.clone());
          if (isApiErrorResponse(payload)) {
            throw new Error(payload.error);
          }
          if (shouldRetryStatus(processedResponse.status) && attempt < this.maxRetries) {
            const delay = this.retryDelayMs * Math.pow(2, attempt);
            attempt += 1;
            await wait(delay);
            continue;
          }
          throw new Error('Request failed');
        }

        const payload = await safeJson(processedResponse.clone());
        if (isApiErrorResponse(payload)) {
          throw new Error(payload.error);
        }
        return payload as T;
      } catch (error) {
        clearTimeout(timeoutId);
        const isAbortError = error instanceof DOMException && error.name === 'AbortError';
        const isNetworkError = error instanceof TypeError;
        if ((isAbortError || isNetworkError) && attempt < this.maxRetries) {
          const delay = this.retryDelayMs * Math.pow(2, attempt);
          attempt += 1;
          await wait(delay);
          continue;
        }
        throw error;
      }
    }
  }
}

export function createBackendApiClient(): BackendAPIClient {
  const configuredUrl = (import.meta.env.VITE_BACKEND_API_URL as string | undefined)?.replace(
    /\/$/,
    ''
  );
  const baseUrl =
    configuredUrl ??
    'https://e5lia9n9hg.execute-api.ap-northeast-2.amazonaws.com/dev';
  return new BackendAPIClient({ baseUrl });
}
