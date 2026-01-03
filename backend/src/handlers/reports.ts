import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

import { DataAggregator } from '../services/data-aggregator.js';
import { QueryValidator } from '../utils/query-validator.js';
import { handleError } from '../utils/error-handler.js';
import { createDefaultDependencies, type HandlerDependencies } from './deps.js';
import { createResponse, isOptionsRequest, parseBoolean } from './http.js';

function buildDependencies(deps?: HandlerDependencies): HandlerDependencies {
  return deps ?? createDefaultDependencies();
}

export function createComprehensiveReportHandler(deps?: HandlerDependencies) {
  const { serpapi, cache } = buildDependencies(deps);
  const aggregator = new DataAggregator(serpapi);

  return async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    if (isOptionsRequest(event)) {
      return createResponse(204, {});
    }
    try {
      const params = event.queryStringParameters ?? {};
      const query = params.q ?? '';

      const includeNews = parseBoolean(params.include_news) ?? false;
      const includeShopping = parseBoolean(params.include_shopping) ?? false;
      const includeTrendingNow = parseBoolean(params.include_trending_now) ?? false;

      QueryValidator.validateQueries(query);

      const options = {
        query,
        date: params.date,
        geo: params.geo,
        includeNews,
        includeShopping,
        includeTrendingNow,
      };

      const cacheKey = cache.generateCacheKey('report', options);
      const noCache = parseBoolean(params.no_cache);
      if (!noCache) {
        const cached = await cache.getCachedData(cacheKey);
        if (cached) {
          return createResponse(200, cached);
        }
      }

      const report = await aggregator.generateComprehensiveReport(options);
      await cache.setCachedData(cacheKey, report, 'report');
      return createResponse(200, report);
    } catch (error) {
      return handleError(error);
    }
  };
}

export const comprehensiveReportHandler =
  process.env.NODE_ENV === 'test' ? undefined : createComprehensiveReportHandler();
