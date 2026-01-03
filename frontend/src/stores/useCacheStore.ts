import { create } from 'zustand';

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
  key: string;
  data: T;
  cachedAt: number;
  ttlSeconds: number;
  expiresAt: number;
  dataType: CacheDataType;
}

interface CacheState {
  entries: Map<string, CacheEntry<unknown>>;
  maxEntries: number;
  getTTLForDataType: (dataType: CacheDataType) => number;
  get: <T>(key: string) => T | null;
  set: <T>(
    key: string,
    value: T,
    dataType?: CacheDataType,
    ttlSeconds?: number
  ) => void;
  invalidate: (key: string) => void;
  clear: () => void;
  size: () => number;
  setMaxEntries: (maxEntries: number) => void;
}

function nowMs(): number {
  return Date.now();
}

function buildEntry<T>(
  key: string,
  data: T,
  dataType: CacheDataType,
  ttlSeconds: number
): CacheEntry<T> {
  const cachedAt = nowMs();
  return {
    key,
    data,
    cachedAt,
    ttlSeconds,
    expiresAt: cachedAt + ttlSeconds * 1000,
    dataType,
  };
}

export const useCacheStore = create<CacheState>((set, get) => ({
  entries: new Map(),
  maxEntries: 200,
  getTTLForDataType: (dataType) => {
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
      default:
        return 3600;
    }
  },
  get: <T,>(key: string) => {
    const entries = get().entries;
    const entry = entries.get(key);
    if (!entry) return null;
    if (nowMs() > entry.expiresAt) {
      entries.delete(key);
      set({ entries: new Map(entries) });
      return null;
    }
    entries.delete(key);
    entries.set(key, entry);
    set({ entries: new Map(entries) });
    return entry.data as T;
  },
  set: <T,>(key: string, value: T, dataType: CacheDataType = 'default', ttlSeconds?: number) => {
    const entries = get().entries;
    const ttl = ttlSeconds ?? get().getTTLForDataType(dataType);
    entries.delete(key);
    entries.set(key, buildEntry(key, value, dataType, ttl));

    while (entries.size > get().maxEntries) {
      const oldestKey = entries.keys().next().value as string | undefined;
      if (!oldestKey) break;
      entries.delete(oldestKey);
    }

    set({ entries: new Map(entries) });
  },
  invalidate: (key: string) => {
    const entries = get().entries;
    entries.delete(key);
    set({ entries: new Map(entries) });
  },
  clear: () => set({ entries: new Map() }),
  size: () => get().entries.size,
  setMaxEntries: (maxEntries: number) => set({ maxEntries }),
}));
