import assert from 'node:assert/strict';
import test from 'node:test';

import { DataAggregator } from '../src/services/data-aggregator.js';

class FakeSerpAPIClient {
  async search(params: { engine: string; data_type?: string }): Promise<unknown> {
    if (params.engine === 'google_trends' && params.data_type === 'TIMESERIES') {
      return {
        interest_over_time: {
          timeline_data: [
            {
              date: 'Jan 1 – 7, 2024',
              values: [{ query: 'coffee', value: '50', extracted_value: 50 }],
            },
            {
              date: 'Jan 8 – 14, 2024',
              values: [{ query: 'coffee', value: '100', extracted_value: 100 }],
            },
          ],
        },
      };
    }

    if (params.engine === 'google_trends' && params.data_type === 'GEO_MAP_0') {
      return {
        interest_by_region: [
          { geo: 'US', location: 'United States', value: '100', extracted_value: 100 },
        ],
      };
    }

    if (params.engine === 'google') {
      return {
        news_results: [
          { title: 'Coffee news', link: 'https://news.example.com', source: 'News' },
        ],
      };
    }

    if (params.engine === 'google_shopping') {
      return {
        shopping_results: [
          { title: 'Coffee beans', link: 'https://shop.example.com', price: '$10' },
        ],
      };
    }

    if (params.engine === 'google_trends_trending_now') {
      return {
        trending_searches: [
          { query: 'coffee', serpapi_news_link: 'https://serpapi.com' },
        ],
      };
    }

    return {};
  }
}

test('Property 14: Comprehensive Report Data Sources', async () => {
  const aggregator = new DataAggregator(new FakeSerpAPIClient() as unknown as never);
  const report = await aggregator.generateComprehensiveReport({
    query: 'coffee',
    includeNews: true,
    includeShopping: true,
    includeTrendingNow: true,
  });

  assert.ok(report.timeSeries);
  assert.ok(report.regional);
  assert.ok(report.news);
  assert.ok(report.shopping);
  assert.ok(report.trendingNow);
});

test('Property 15: Timestamp Normalization', async () => {
  const aggregator = new DataAggregator(new FakeSerpAPIClient() as unknown as never);
  const report = await aggregator.generateComprehensiveReport({
    query: 'coffee',
  });

  assert.ok(report.timeSeries);
  const points = report.timeSeries?.series[0].data ?? [];
  assert.ok(points.every((point) => Number.isFinite(point.timestamp)));
});

test('Property 18: Aggregate Metrics Calculation', async () => {
  const aggregator = new DataAggregator(new FakeSerpAPIClient() as unknown as never);
  const report = await aggregator.generateComprehensiveReport({
    query: 'coffee',
  });

  assert.ok(report.metrics);
  assert.equal(report.metrics?.averageInterest, 75);
  assert.equal(report.metrics?.peakInterest, 100);
});
