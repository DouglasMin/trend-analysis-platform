import type { CacheDataType } from '@/stores/useCacheStore';

type CacheKeyParams = Record<string, unknown> | object;

function normalize(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map((entry) => normalize(entry));
  }
  if (value && typeof value === 'object') {
    const obj = value as Record<string, unknown>;
    const sorted: Record<string, unknown> = {};
    Object.keys(obj)
      .sort()
      .forEach((key) => {
        sorted[key] = normalize(obj[key]);
      });
    return sorted;
  }
  return value;
}

export function buildCacheKey(dataType: CacheDataType, params: CacheKeyParams): string {
  const normalized = normalize(params as Record<string, unknown>);
  return `${dataType}:${JSON.stringify(normalized)}`;
}
