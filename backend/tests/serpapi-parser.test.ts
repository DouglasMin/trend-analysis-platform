import assert from 'node:assert/strict';
import test from 'node:test';

import {
  parseComparedBreakdownByRegion,
  parseInterestByRegion,
  parseInterestOverTime,
  parseNewsTrends,
  parseRelatedQueries,
  parseRelatedTopics,
  parseShoppingTrends,
} from '../src/services/serpapi-parser.js';

test('Property 3: Time Series Data Completeness', () => {
  const response = {
    interest_over_time: {
      timeline_data: [
        {
          date: 'Oct 24 – 30, 2021',
          values: [
            { query: 'Mercedes', value: '56', extracted_value: 56 },
            { query: 'BMW', value: '80', extracted_value: 80 },
          ],
        },
      ],
    },
  };

  const parsed = parseInterestOverTime(response);
  assert.equal(parsed.series.length, 2);
  const mercedes = parsed.series.find((series) => series.query === 'Mercedes');
  const bmw = parsed.series.find((series) => series.query === 'BMW');
  assert.ok(mercedes);
  assert.ok(bmw);
  assert.equal(mercedes.data.length, 1);
  assert.equal(bmw.data.length, 1);
  assert.equal(mercedes.data[0].value, 56);
  assert.equal(bmw.data[0].value, 80);
});

test('Property 4: Regional Data Completeness', () => {
  const byRegionResponse = {
    interest_by_region: [
      { geo: 'AL', location: 'Albania', value: '100', extracted_value: 100 },
      { geo: 'TH', location: 'Thailand', value: '4', extracted_value: 4 },
    ],
  };

  const byRegion = parseInterestByRegion(byRegionResponse);
  assert.equal(byRegion.series.length, 1);
  assert.equal(byRegion.series[0].values.length, 2);
  assert.deepStrictEqual(byRegion.series[0].values[0], {
    location: 'Albania',
    geoCode: 'AL',
    value: 100,
  });

  const comparedResponse = {
    compared_breakdown_by_region: [
      {
        geo: 'LT',
        location: 'Lithuania',
        values: [
          { query: 'Mercedes', value: '13%', extracted_value: 13 },
          { query: 'BMW', value: '52%', extracted_value: 52 },
        ],
      },
    ],
  };

  const compared = parseComparedBreakdownByRegion(comparedResponse);
  assert.equal(compared.series.length, 2);
  const mercedes = compared.series.find((series) => series.query === 'Mercedes');
  const bmw = compared.series.find((series) => series.query === 'BMW');
  assert.ok(mercedes);
  assert.ok(bmw);
  assert.equal(mercedes.values[0].geoCode, 'LT');
  assert.equal(bmw.values[0].value, 52);
});

test('Property 5: Related Queries Completeness', () => {
  const response = {
    related_queries: {
      top: [
        {
          query: 'a4 audi',
          value: '100',
          extracted_value: 100,
          link: 'https://trends.google.com/trends/explore?q=a4+audi',
        },
      ],
      rising: [
        {
          query: 'wheel of fortune contestant loses audi',
          value: '+2,800%',
          extracted_value: 2800,
          link: 'https://trends.google.com/trends/explore?q=wheel+of+fortune+contestant+loses+audi',
        },
      ],
    },
  };

  const parsed = parseRelatedQueries(response);
  assert.equal(parsed.top.length, 1);
  assert.equal(parsed.rising.length, 1);
  assert.equal(parsed.top[0].query, 'a4 audi');
  assert.equal(parsed.top[0].value, 100);
  assert.equal(parsed.rising[0].growthPercentage, 2800);
});

test('Property 6: Related Topics Completeness', () => {
  const response = {
    related_topics: {
      top: [
        {
          topic: { title: 'Mercedes-Benz', type: 'Luxury vehicles company' },
          value: '100',
          extracted_value: 100,
          link: 'https://trends.google.com/trends/explore?q=/m/052mx',
        },
      ],
      rising: [
        {
          topic: { title: 'Mercedes-Benz EQB', type: 'SUV' },
          value: '+700%',
          extracted_value: 700,
          link: 'https://trends.google.com/trends/explore?q=/g/11h__y1vw4',
        },
      ],
    },
  };

  const parsed = parseRelatedTopics(response);
  assert.equal(parsed.top.length, 1);
  assert.equal(parsed.rising.length, 1);
  assert.equal(parsed.top[0].title, 'Mercedes-Benz');
  assert.equal(parsed.top[0].type, 'Luxury vehicles company');
  assert.equal(parsed.rising[0].growthPercentage, 700);
});

test('Property 10: News Articles Completeness', () => {
  const response = {
    news_results: [
      {
        title: 'Trend headline',
        link: 'https://news.example.com/story',
        source: 'Example News',
        date: '1 day ago',
        snippet: 'Snippet',
      },
    ],
    serpapi_pagination: {
      next_page_token: 'next-token',
    },
  };

  const parsed = parseNewsTrends(response);
  assert.equal(parsed.articles.length, 1);
  assert.equal(parsed.articles[0].title, 'Trend headline');
  assert.equal(parsed.articles[0].source, 'Example News');
  assert.equal(parsed.nextPageToken, 'next-token');
});

test('Property 11: Shopping Results Completeness', () => {
  const response = {
    shopping_results: [
      {
        title: 'Product name',
        link: 'https://shop.example.com/item',
        source: 'Shop',
        price: '$10',
        extracted_price: 10,
        original_price: '$12',
        rating: 4.2,
        reviews: 120,
        shipping: 'Free shipping',
        thumbnail: 'https://img.example.com/1.png',
      },
    ],
    filters: [
      {
        name: 'Brand',
        options: [{ value: 'Brand A' }, { value: 'Brand B' }],
      },
    ],
  };

  const parsed = parseShoppingTrends(response);
  assert.equal(parsed.items.length, 1);
  assert.equal(parsed.items[0].title, 'Product name');
  assert.equal(parsed.items[0].extractedPrice, 10);
  assert.equal(parsed.filters?.length, 1);
  assert.deepStrictEqual(parsed.filters?.[0], { name: 'Brand', values: ['Brand A', 'Brand B'] });
});
