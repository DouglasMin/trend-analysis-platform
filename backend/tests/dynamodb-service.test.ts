import assert from 'node:assert/strict';
import test from 'node:test';

import { DeleteCommand, GetCommand, PutCommand, type DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

import { DynamoDBService, type CacheEntry, type CacheDataType } from '../src/services/dynamodb-service.js';

class InMemoryDocumentClient {
  private store = new Map<string, CacheEntry<unknown>>();

  async send(command: GetCommand | PutCommand | DeleteCommand): Promise<{ Item?: unknown }> {
    if (command instanceof GetCommand) {
      const pk = command.input.Key?.pk as string;
      return { Item: this.store.get(pk) };
    }
    if (command instanceof PutCommand) {
      const item = command.input.Item as CacheEntry<unknown>;
      this.store.set(item.pk, item);
      return {};
    }
    if (command instanceof DeleteCommand) {
      const pk = command.input.Key?.pk as string;
      this.store.delete(pk);
      return {};
    }
    return {};
  }

  getItem(key: string): CacheEntry<unknown> | undefined {
    return this.store.get(key);
  }
}

test('Property 27: Cache-First Strategy', async () => {
  const client = new InMemoryDocumentClient();
  const now = 1_700_000_000_000;
  const service = new DynamoDBService({
    tableName: 'test-table',
    documentClient: client as unknown as DynamoDBDocumentClient,
    nowProvider: () => now,
  });

  await service.setCachedData('cache-key', { ok: true }, 'time_series');
  const result = await service.getCachedData<{ ok: boolean }>('cache-key');

  assert.deepStrictEqual(result, { ok: true });
});

test('Property 28: Cache Timestamp Storage', async () => {
  const client = new InMemoryDocumentClient();
  const now = 1_700_000_123_000;
  const service = new DynamoDBService({
    tableName: 'test-table',
    documentClient: client as unknown as DynamoDBDocumentClient,
    nowProvider: () => now,
  });

  await service.setCachedData('cache-key', { value: 42 }, 'time_series');
  const stored = client.getItem('cache-key');

  assert.ok(stored);
  assert.equal(stored.cachedAt, now);
  assert.equal(stored.ttlSeconds, 3600);
  assert.equal(stored.expiresAt, Math.floor(now / 1000) + 3600);
});

test('Property 29: Cache TTL Validation', async () => {
  const client = new InMemoryDocumentClient();
  let now = 1_700_000_000_000;
  const service = new DynamoDBService({
    tableName: 'test-table',
    documentClient: client as unknown as DynamoDBDocumentClient,
    nowProvider: () => now,
  });

  await service.setCachedData('cache-key', { ok: true }, 'trending_now');
  now += 301_000;

  const result = await service.getCachedData('cache-key');
  assert.equal(result, null);
});

test('Property 30: Data Type Specific TTLs', async () => {
  const client = new InMemoryDocumentClient();
  const now = 1_700_000_000_000;
  const service = new DynamoDBService({
    tableName: 'test-table',
    documentClient: client as unknown as DynamoDBDocumentClient,
    nowProvider: () => now,
  });

  const types: CacheDataType[] = ['time_series', 'trending_now', 'related', 'news'];
  for (const dataType of types) {
    await service.setCachedData(`cache-${dataType}`, { ok: true }, dataType);
  }

  const ttlSeries = client.getItem('cache-time_series')?.ttlSeconds;
  const ttlTrending = client.getItem('cache-trending_now')?.ttlSeconds;
  const ttlRelated = client.getItem('cache-related')?.ttlSeconds;
  const ttlNews = client.getItem('cache-news')?.ttlSeconds;

  assert.equal(ttlSeries, 3600);
  assert.equal(ttlTrending, 300);
  assert.equal(ttlRelated, 86400);
  assert.equal(ttlNews, 900);
});
