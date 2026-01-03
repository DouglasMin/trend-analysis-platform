import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

import { parseNewsTrends, parseTrendingNow } from '../services/serpapi-parser.js';
import { QueryValidator } from '../utils/query-validator.js';
import { handleError } from '../utils/error-handler.js';
import { createDefaultDependencies, type HandlerDependencies } from './deps.js';
import { createResponse, isOptionsRequest, parseBoolean, parseNumber, parseOneOf } from './http.js';

function buildDependencies(deps?: HandlerDependencies): HandlerDependencies {
  return deps ?? createDefaultDependencies();
}

export function createTrendingNowHandler(deps?: HandlerDependencies) {
  const { serpapi, cache } = buildDependencies(deps);
  return async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    if (isOptionsRequest(event)) {
      return createResponse(204, {});
    }
    try {
      const params = event.queryStringParameters ?? {};
      const frequency = parseOneOf<'realtime' | 'daily'>(params.frequency, ['realtime', 'daily']);
      const requestParams = {
        engine: 'google_trends_trending_now',
        geo: params.geo,
        hl: params.hl,
        frequency,
      } as const;

      QueryValidator.validateParams(requestParams);

      const noCache = parseBoolean(params.no_cache);
      const cacheKey = cache.generateCacheKey('trending_now', requestParams);
      if (!noCache) {
        const cached = await cache.getCachedData(cacheKey);
        if (cached) {
          return createResponse(200, cached);
        }
      }

      const response = await serpapi.search(requestParams, { noCache: noCache ?? false });
      const parsed = parseTrendingNow(response);
      await cache.setCachedData(cacheKey, parsed, 'trending_now');
      return createResponse(200, parsed);
    } catch (error) {
      return handleError(error);
    }
  };
}

export function createNewsTrendsHandler(deps?: HandlerDependencies) {
  const { serpapi, cache } = buildDependencies(deps);
  return async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    if (isOptionsRequest(event)) {
      return createResponse(204, {});
    }
    try {
      const params = event.queryStringParameters ?? {};
      const noCache = parseBoolean(params.no_cache);

      let requestParams;
      if (params.news_page_token) {
        requestParams = {
          engine: 'google_trends_news',
          news_page_token: params.news_page_token,
          geo: params.geo,
          hl: params.hl,
        } as const;
      } else {
        requestParams = {
          engine: 'google',
          q: params.q ?? '',
          tbm: 'nws',
          tbs: params.tbs,
          start: parseNumber(params.start),
          hl: params.hl,
          gl: params.gl,
          location: params.location,
        } as const;
      }

      QueryValidator.validateParams(requestParams);

      const cacheKey = cache.generateCacheKey('news', requestParams);
      if (!noCache) {
        const cached = await cache.getCachedData(cacheKey);
        if (cached) {
          return createResponse(200, cached);
        }
      }

      const response = await serpapi.search(requestParams, { noCache: noCache ?? false });
      const parsed = parseNewsTrends(response);
      await cache.setCachedData(cacheKey, parsed, 'news');
      return createResponse(200, parsed);
    } catch (error) {
      return handleError(error);
    }
  };
}

export const trendingNowHandler =
  process.env.NODE_ENV === 'test' ? undefined : createTrendingNowHandler();
export const newsTrendsHandler =
  process.env.NODE_ENV === 'test' ? undefined : createNewsTrendsHandler();
