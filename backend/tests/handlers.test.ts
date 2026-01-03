import assert from 'node:assert/strict';
import test from 'node:test';

import { createInterestOverTimeHandler, createRelatedQueriesHandler } from '../src/handlers/trends.js';
import type { HandlerDependencies } from '../src/handlers/deps.js';

class FakeSerpAPIClient {
  lastParams: unknown;
  async search(params: unknown): Promise<unknown> {
    this.lastParams = params;
    return {
      interest_over_time: {
        timeline_data: [
          {
            date: 'Jan 1 – 7, 2024',
            values: [
              { query: 'alpha', value: '50', extracted_value: 50 },
              { query: 'beta', value: '75', extracted_value: 75 },
            ],
          },
        ],
      },
    };
  }
}

class FakeCache {
  private store = new Map<string, unknown>();
  generateCacheKey(type: string, params: Record<string, unknown>): string {
    return `${type}:${JSON.stringify(params)}`;
  }
  async getCachedData(key: string): Promise<unknown | null> {
    return this.store.get(key) ?? null;
  }
  async setCachedData(key: string, data: unknown): Promise<void> {
    this.store.set(key, data);
  }
}

test('Property 1: API Parameter Forwarding', async () => {
  const serpapi = new FakeSerpAPIClient();
  const cache = new FakeCache();
  const handler = createInterestOverTimeHandler({
    serpapi: serpapi as unknown as HandlerDependencies['serpapi'],
    cache: cache as unknown as HandlerDependencies['cache'],
  });

  const event = {
    httpMethod: 'GET',
    queryStringParameters: {
      q: 'alpha,beta',
      date: 'today 12-m',
      geo: 'US',
      cat: '0',
      gprop: 'news',
      no_cache: 'true',
    },
  } as const;

  const result = await handler(event as never);
  assert.equal(result.statusCode, 200);
  const params = serpapi.lastParams as Record<string, unknown>;
  assert.equal(params.engine, 'google_trends');
  assert.equal(params.q, 'alpha,beta');
  assert.equal(params.data_type, 'TIMESERIES');
  assert.equal(params.date, 'today 12-m');
  assert.equal(params.geo, 'US');
  assert.equal(params.cat, '0');
  assert.equal(params.gprop, 'news');
});

test('Property 2: Multi-Query Support', async () => {
  const serpapi = new FakeSerpAPIClient();
  const cache = new FakeCache();
  const handler = createInterestOverTimeHandler({
    serpapi: serpapi as unknown as HandlerDependencies['serpapi'],
    cache: cache as unknown as HandlerDependencies['cache'],
  });

  const event = {
    httpMethod: 'GET',
    queryStringParameters: {
      q: 'alpha,beta',
      no_cache: 'true',
    },
  } as const;

  const result = await handler(event as never);
  const body = JSON.parse(result.body) as { series: Array<{ query: string }> };
  assert.equal(body.series.length, 2);
  assert.ok(body.series.some((series) => series.query === 'alpha'));
  assert.ok(body.series.some((series) => series.query === 'beta'));
});

test('Property 7: Rising Trends Percentage Extraction', async () => {
  const serpapi = new FakeSerpAPIClient();
  serpapi.search = async () => ({
    related_queries: {
      rising: [
        {
          query: 'example trend',
          value: '+2,800%',
          extracted_value: 2800,
          link: 'https://trends.google.com/trends/explore?q=example',
        },
      ],
    },
  });
  const cache = new FakeCache();
  const handler = createRelatedQueriesHandler({
    serpapi: serpapi as unknown as HandlerDependencies['serpapi'],
    cache: cache as unknown as HandlerDependencies['cache'],
  });

  const event = {
    httpMethod: 'GET',
    queryStringParameters: {
      q: 'example',
      no_cache: 'true',
    },
  } as const;

  const result = await handler(event as never);
  const body = JSON.parse(result.body) as { rising: Array<{ growthPercentage?: number }> };
  assert.equal(body.rising.length, 1);
  assert.equal(body.rising[0].growthPercentage, 2800);
});
