import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

import { parseComparedBreakdownByRegion, parseInterestByRegion, parseInterestOverTime, parseRelatedQueries, parseRelatedTopics } from '../services/serpapi-parser.js';
import { QueryValidator } from '../utils/query-validator.js';
import { handleError } from '../utils/error-handler.js';
import { createDefaultDependencies, type HandlerDependencies } from './deps.js';
import { createResponse, isOptionsRequest, parseBoolean, parseOneOf } from './http.js';
import type { TrendProperty } from '../types/index.js';

function buildDependencies(deps?: HandlerDependencies): HandlerDependencies {
  return deps ?? createDefaultDependencies();
}

export function createInterestOverTimeHandler(deps?: HandlerDependencies) {
  const { serpapi, cache } = buildDependencies(deps);
  return async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    if (isOptionsRequest(event)) {
      return createResponse(204, {});
    }
    try {
      const params = event.queryStringParameters ?? {};
      const gprop = parseOneOf<TrendProperty>(params.gprop, ['images', 'news', 'youtube', 'froogle']);
      const requestParams = {
        engine: 'google_trends',
        q: params.q ?? '',
        data_type: 'TIMESERIES',
        date: params.date,
        geo: params.geo,
        cat: params.cat,
        gprop,
      } as const;

      QueryValidator.validateParams(requestParams);

      const noCache = parseBoolean(params.no_cache);
      const cacheKey = cache.generateCacheKey('time_series', requestParams);
      if (!noCache) {
        const cached = await cache.getCachedData(cacheKey);
        if (cached) {
          return createResponse(200, cached);
        }
      }

      const response = await serpapi.search(requestParams, { noCache: noCache ?? false });
      const parsed = parseInterestOverTime(response);
      await cache.setCachedData(cacheKey, parsed, 'time_series');
      return createResponse(200, parsed);
    } catch (error) {
      return handleError(error);
    }
  };
}

export function createInterestByRegionHandler(deps?: HandlerDependencies) {
  const { serpapi, cache } = buildDependencies(deps);
  return async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    if (isOptionsRequest(event)) {
      return createResponse(204, {});
    }
    try {
      const params = event.queryStringParameters ?? {};
      const gprop = parseOneOf<TrendProperty>(params.gprop, ['images', 'news', 'youtube', 'froogle']);
      const requestParams = {
        engine: 'google_trends',
        q: params.q ?? '',
        data_type: 'GEO_MAP_0',
        date: params.date,
        geo: params.geo,
        cat: params.cat,
        gprop,
      } as const;

      QueryValidator.validateParams(requestParams);

      const noCache = parseBoolean(params.no_cache);
      const cacheKey = cache.generateCacheKey('region', requestParams);
      if (!noCache) {
        const cached = await cache.getCachedData(cacheKey);
        if (cached) {
          return createResponse(200, cached);
        }
      }

      const response = await serpapi.search(requestParams, { noCache: noCache ?? false });
      const parsed = parseInterestByRegion(response);
      await cache.setCachedData(cacheKey, parsed, 'region');
      return createResponse(200, parsed);
    } catch (error) {
      return handleError(error);
    }
  };
}

export function createComparedBreakdownByRegionHandler(deps?: HandlerDependencies) {
  const { serpapi, cache } = buildDependencies(deps);
  return async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    if (isOptionsRequest(event)) {
      return createResponse(204, {});
    }
    try {
      const params = event.queryStringParameters ?? {};
      const gprop = parseOneOf<TrendProperty>(params.gprop, ['images', 'news', 'youtube', 'froogle']);
      const requestParams = {
        engine: 'google_trends',
        q: params.q ?? '',
        data_type: 'GEO_MAP',
        date: params.date,
        geo: params.geo,
        cat: params.cat,
        gprop,
      } as const;

      QueryValidator.validateParams(requestParams);

      const noCache = parseBoolean(params.no_cache);
      const cacheKey = cache.generateCacheKey('region', requestParams);
      if (!noCache) {
        const cached = await cache.getCachedData(cacheKey);
        if (cached) {
          return createResponse(200, cached);
        }
      }

      const response = await serpapi.search(requestParams, { noCache: noCache ?? false });
      const parsed = parseComparedBreakdownByRegion(response);
      await cache.setCachedData(cacheKey, parsed, 'region');
      return createResponse(200, parsed);
    } catch (error) {
      return handleError(error);
    }
  };
}

export function createRelatedQueriesHandler(deps?: HandlerDependencies) {
  const { serpapi, cache } = buildDependencies(deps);
  return async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    if (isOptionsRequest(event)) {
      return createResponse(204, {});
    }
    try {
      const params = event.queryStringParameters ?? {};
      const gprop = parseOneOf<TrendProperty>(params.gprop, ['images', 'news', 'youtube', 'froogle']);
      const requestParams = {
        engine: 'google_trends',
        q: params.q ?? '',
        data_type: 'RELATED_QUERIES',
        date: params.date,
        geo: params.geo,
        cat: params.cat,
        gprop,
      } as const;

      QueryValidator.validateParams(requestParams);

      const noCache = parseBoolean(params.no_cache);
      const cacheKey = cache.generateCacheKey('related', requestParams);
      if (!noCache) {
        const cached = await cache.getCachedData(cacheKey);
        if (cached) {
          return createResponse(200, cached);
        }
      }

      const response = await serpapi.search(requestParams, { noCache: noCache ?? false });
      const parsed = parseRelatedQueries(response);
      await cache.setCachedData(cacheKey, parsed, 'related');
      return createResponse(200, parsed);
    } catch (error) {
      return handleError(error);
    }
  };
}

export function createRelatedTopicsHandler(deps?: HandlerDependencies) {
  const { serpapi, cache } = buildDependencies(deps);
  return async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    if (isOptionsRequest(event)) {
      return createResponse(204, {});
    }
    try {
      const params = event.queryStringParameters ?? {};
      const gprop = parseOneOf<TrendProperty>(params.gprop, ['images', 'news', 'youtube', 'froogle']);
      const requestParams = {
        engine: 'google_trends',
        q: params.q ?? '',
        data_type: 'RELATED_TOPICS',
        date: params.date,
        geo: params.geo,
        cat: params.cat,
        gprop,
      } as const;

      QueryValidator.validateParams(requestParams);

      const noCache = parseBoolean(params.no_cache);
      const cacheKey = cache.generateCacheKey('related', requestParams);
      if (!noCache) {
        const cached = await cache.getCachedData(cacheKey);
        if (cached) {
          return createResponse(200, cached);
        }
      }

      const response = await serpapi.search(requestParams, { noCache: noCache ?? false });
      const parsed = parseRelatedTopics(response);
      await cache.setCachedData(cacheKey, parsed, 'related');
      return createResponse(200, parsed);
    } catch (error) {
      return handleError(error);
    }
  };
}

export const interestOverTimeHandler =
  process.env.NODE_ENV === 'test' ? undefined : createInterestOverTimeHandler();
export const interestByRegionHandler =
  process.env.NODE_ENV === 'test' ? undefined : createInterestByRegionHandler();
export const comparedBreakdownByRegionHandler =
  process.env.NODE_ENV === 'test' ? undefined : createComparedBreakdownByRegionHandler();
export const relatedQueriesHandler =
  process.env.NODE_ENV === 'test' ? undefined : createRelatedQueriesHandler();
export const relatedTopicsHandler =
  process.env.NODE_ENV === 'test' ? undefined : createRelatedTopicsHandler();
