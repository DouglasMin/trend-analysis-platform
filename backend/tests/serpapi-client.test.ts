import assert from 'node:assert/strict';
import test from 'node:test';

import { SerpAPIClient } from '../src/services/serpapi-client.js';
import type { SearchParams } from '../src/types/index.js';
import { NetworkError } from '../src/types/index.js';

const baseParams: SearchParams = {
  engine: 'google_trends',
  q: 'test',
  data_type: 'TIMESERIES',
};

test('Property 20: API Key Inclusion', async () => {
  const seen: URL[] = [];
  const fetchFn: typeof fetch = async (url) => {
    seen.push(new URL(url.toString()));
    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  };

  const client = new SerpAPIClient({ apiKey: 'test-key', fetchFn });
  await client.search(baseParams);

  assert.equal(seen.length, 1);
  const params = seen[0].searchParams;
  assert.equal(params.get('api_key'), 'test-key');
  assert.equal(params.get('engine'), 'google_trends');
  assert.equal(params.get('q'), 'test');
  assert.equal(params.get('data_type'), 'TIMESERIES');
});

test('Property 22: Exponential Backoff Pattern', async () => {
  let attempts = 0;
  const delays: number[] = [];
  const fetchFn: typeof fetch = async () => {
    attempts += 1;
    if (attempts <= 3) {
      return new Response(JSON.stringify({ error: 'Rate limit exceeded' }), { status: 429 });
    }
    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  };

  const client = new SerpAPIClient({ apiKey: 'test-key', fetchFn }) as SerpAPIClient & {
    delay: (ms: number) => Promise<void>;
  };
  client.delay = async (ms) => {
    delays.push(ms);
  };

  await client.search(baseParams);

  assert.equal(attempts, 4);
  assert.deepStrictEqual(delays, [1000, 2000, 4000]);
});

test('Property 23: Retry Limit', async () => {
  let attempts = 0;
  const fetchFn: typeof fetch = async () => {
    attempts += 1;
    throw new Error('Network down');
  };

  const client = new SerpAPIClient({ apiKey: 'test-key', fetchFn });

  await assert.rejects(() => client.search(baseParams), (error) => error instanceof NetworkError);
  assert.equal(attempts, 4);
});
