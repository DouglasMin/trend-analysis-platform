import {
  DeleteCommand,
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
} from '@aws-sdk/lib-dynamodb';

import { CacheError } from '../types/index.js';

export type CacheDataType =
  | 'time_series'
  | 'region'
  | 'related'
  | 'trending_now'
  | 'news'
  | 'shopping'
  | 'report'
  | 'default';

export interface CacheEntry<T> {
  pk: string;
  data: T;
  cachedAt: number;
  ttlSeconds: number;
  expiresAt: number;
}

export interface DynamoDBServiceOptions {
  tableName?: string;
  documentClient: DynamoDBDocumentClient;
  nowProvider?: () => number;
}

export class DynamoDBService {
  private readonly tableName: string;
  private readonly documentClient: DynamoDBDocumentClient;
  private readonly nowProvider: () => number;

  constructor(options: DynamoDBServiceOptions) {
    if (!options.tableName && !process.env.DYNAMODB_TABLE) {
      throw new CacheError('DYNAMODB_TABLE is required');
    }
    this.tableName = options.tableName ?? process.env.DYNAMODB_TABLE ?? '';
    this.documentClient = options.documentClient;
    this.nowProvider = options.nowProvider ?? (() => Date.now());
  }

  async getCachedData<T>(cacheKey: string): Promise<T | null> {
    const result = await this.documentClient.send(
      new GetCommand({ TableName: this.tableName, Key: { pk: cacheKey } }),
    );

    const item = result.Item as CacheEntry<T> | undefined;
    if (!item) {
      return null;
    }

    if (this.isExpired(item)) {
      await this.deleteCachedData(cacheKey);
      return null;
    }

    return item.data;
  }

  async setCachedData<T>(
    cacheKey: string,
    data: T,
    dataType: CacheDataType = 'default',
  ): Promise<void> {
    const ttlSeconds = this.getTTLForDataType(dataType);
    const cachedAt = this.nowProvider();
    const expiresAt = Math.floor(cachedAt / 1000) + ttlSeconds;

    const item: CacheEntry<T> = {
      pk: cacheKey,
      data,
      cachedAt,
      ttlSeconds,
      expiresAt,
    };

    await this.documentClient.send(new PutCommand({ TableName: this.tableName, Item: item }));
  }

  async deleteCachedData(cacheKey: string): Promise<void> {
    await this.documentClient.send(
      new DeleteCommand({ TableName: this.tableName, Key: { pk: cacheKey } }),
    );
  }

  generateCacheKey(dataType: CacheDataType, params: Record<string, unknown>): string {
    const normalized = this.normalize(params);
    return `${dataType}:${JSON.stringify(normalized)}`;
  }

  getTTLForDataType(dataType: CacheDataType): number {
    switch (dataType) {
      case 'trending_now':
        return 300;
      case 'news':
        return 900;
      case 'shopping':
        return 1800;
      case 'time_series':
        return 3600;
      case 'region':
        return 3600;
      case 'related':
        return 86400;
      case 'report':
        return 900;
      case 'default':
      default:
        return 3600;
    }
  }

  private isExpired<T>(item: CacheEntry<T>): boolean {
    const now = this.nowProvider();
    return now - item.cachedAt > item.ttlSeconds * 1000;
  }

  private normalize(value: unknown): unknown {
    if (Array.isArray(value)) {
      return value.map((entry) => this.normalize(entry));
    }
    if (value && typeof value === 'object') {
      const obj = value as Record<string, unknown>;
      const sorted: Record<string, unknown> = {};
      Object.keys(obj)
        .sort()
        .forEach((key) => {
          sorted[key] = this.normalize(obj[key]);
        });
      return sorted;
    }
    return value;
  }
}
