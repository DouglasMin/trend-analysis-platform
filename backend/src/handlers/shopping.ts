import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

import { parseShoppingTrends } from '../services/serpapi-parser.js';
import { QueryValidator } from '../utils/query-validator.js';
import { handleError } from '../utils/error-handler.js';
import { createDefaultDependencies, type HandlerDependencies } from './deps.js';
import { createResponse, isOptionsRequest, parseBoolean } from './http.js';

function buildDependencies(deps?: HandlerDependencies): HandlerDependencies {
  return deps ?? createDefaultDependencies();
}

export function createShoppingTrendsHandler(deps?: HandlerDependencies) {
  const { serpapi, cache } = buildDependencies(deps);
  return async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    if (isOptionsRequest(event)) {
      return createResponse(204, {});
    }
    try {
      const params = event.queryStringParameters ?? {};
      const requestParams = {
        engine: 'google_shopping',
        q: params.q ?? '',
        location: params.location,
        hl: params.hl,
        gl: params.gl,
      } as const;

      QueryValidator.validateParams(requestParams);

      const noCache = parseBoolean(params.no_cache);
      const cacheKey = cache.generateCacheKey('shopping', requestParams);
      if (!noCache) {
        const cached = await cache.getCachedData(cacheKey);
        if (cached) {
          return createResponse(200, cached);
        }
      }

      const response = await serpapi.search(requestParams, { noCache: noCache ?? false });
      const parsed = parseShoppingTrends(response);
      await cache.setCachedData(cacheKey, parsed, 'shopping');
      return createResponse(200, parsed);
    } catch (error) {
      return handleError(error);
    }
  };
}

export const shoppingTrendsHandler =
  process.env.NODE_ENV === 'test' ? undefined : createShoppingTrendsHandler();
