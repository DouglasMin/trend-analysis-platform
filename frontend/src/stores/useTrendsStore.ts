import { create } from 'zustand';
import { buildCacheKey } from '@/utils/cache';
import { useCacheStore } from './useCacheStore';
import type {
  ComprehensiveReportParams,
  GoogleTrendsParams,
  NewsTrendsParams,
  ShoppingTrendsParams,
  TrendingNowParams,
} from '@/types/params';
import type {
  NewsTrendsData,
  RegionalData,
  RelatedQueries,
  RelatedTopics,
  ShoppingTrendsData,
  TimeSeriesData,
  TrendReport,
  TrendingNowData,
} from '@/types/trend';
import { createBackendApiClient } from '@/services/backend-api-client';

type FetchStatus = 'idle' | 'loading' | 'success' | 'error';

interface FetchState<T> {
  data?: T;
  status: FetchStatus;
  error?: string;
}

interface TrendsState {
  interestOverTime: FetchState<TimeSeriesData>;
  interestByRegion: FetchState<RegionalData>;
  comparedByRegion: FetchState<RegionalData>;
  relatedQueries: FetchState<RelatedQueries>;
  relatedTopics: FetchState<RelatedTopics>;
  trendingNow: FetchState<TrendingNowData>;
  newsTrends: FetchState<NewsTrendsData>;
  shoppingTrends: FetchState<ShoppingTrendsData>;
  comprehensiveReport: FetchState<TrendReport>;
  fetchInterestOverTime: (params: GoogleTrendsParams) => Promise<void>;
  fetchInterestByRegion: (params: GoogleTrendsParams) => Promise<void>;
  fetchComparedByRegion: (params: GoogleTrendsParams) => Promise<void>;
  fetchRelatedQueries: (params: GoogleTrendsParams) => Promise<void>;
  fetchRelatedTopics: (params: GoogleTrendsParams) => Promise<void>;
  fetchTrendingNow: (params: TrendingNowParams) => Promise<void>;
  fetchNewsTrends: (params: NewsTrendsParams) => Promise<void>;
  fetchShoppingTrends: (params: ShoppingTrendsParams) => Promise<void>;
  fetchComprehensiveReport: (params: ComprehensiveReportParams) => Promise<void>;
  clearErrors: () => void;
}

const apiClient = createBackendApiClient();

function setState<T>(
  set: (fn: (state: TrendsState) => TrendsState) => void,
  key: keyof TrendsState,
  updates: Partial<FetchState<T>>
) {
  set((state) => ({
    ...state,
    [key]: { ...(state[key] as FetchState<T>), ...updates },
  }));
}

export const useTrendsStore = create<TrendsState>((set) => ({
  interestOverTime: { status: 'idle' },
  interestByRegion: { status: 'idle' },
  comparedByRegion: { status: 'idle' },
  relatedQueries: { status: 'idle' },
  relatedTopics: { status: 'idle' },
  trendingNow: { status: 'idle' },
  newsTrends: { status: 'idle' },
  shoppingTrends: { status: 'idle' },
  comprehensiveReport: { status: 'idle' },
  fetchInterestOverTime: async (params) => {
    const cacheKey = buildCacheKey('time_series', params);
    const cache = useCacheStore.getState();
    if (!params.no_cache) {
      const cached = cache.get<TimeSeriesData>(cacheKey);
      if (cached) {
        setState(set, 'interestOverTime', { data: cached, status: 'success', error: undefined });
        return;
      }
    }
    setState(set, 'interestOverTime', { status: 'loading', error: undefined });
    try {
      const data = await apiClient.interestOverTime(params);
      cache.set(cacheKey, data, 'time_series');
      setState(set, 'interestOverTime', { data, status: 'success' });
    } catch (error) {
      setState(set, 'interestOverTime', {
        status: 'error',
        error: error instanceof Error ? error.message : 'Failed to load time series',
      });
    }
  },
  fetchInterestByRegion: async (params) => {
    const cacheKey = buildCacheKey('region', params);
    const cache = useCacheStore.getState();
    if (!params.no_cache) {
      const cached = cache.get<RegionalData>(cacheKey);
      if (cached) {
        setState(set, 'interestByRegion', { data: cached, status: 'success', error: undefined });
        return;
      }
    }
    setState(set, 'interestByRegion', { status: 'loading', error: undefined });
    try {
      const data = await apiClient.interestByRegion(params);
      cache.set(cacheKey, data, 'region');
      setState(set, 'interestByRegion', { data, status: 'success' });
    } catch (error) {
      setState(set, 'interestByRegion', {
        status: 'error',
        error: error instanceof Error ? error.message : 'Failed to load regional data',
      });
    }
  },
  fetchComparedByRegion: async (params) => {
    const cacheKey = buildCacheKey('region', params);
    const cache = useCacheStore.getState();
    if (!params.no_cache) {
      const cached = cache.get<RegionalData>(cacheKey);
      if (cached) {
        setState(set, 'comparedByRegion', { data: cached, status: 'success', error: undefined });
        return;
      }
    }
    setState(set, 'comparedByRegion', { status: 'loading', error: undefined });
    try {
      const data = await apiClient.comparedByRegion(params);
      cache.set(cacheKey, data, 'region');
      setState(set, 'comparedByRegion', { data, status: 'success' });
    } catch (error) {
      setState(set, 'comparedByRegion', {
        status: 'error',
        error: error instanceof Error ? error.message : 'Failed to load compared regions',
      });
    }
  },
  fetchRelatedQueries: async (params) => {
    const cacheKey = buildCacheKey('related', params);
    const cache = useCacheStore.getState();
    if (!params.no_cache) {
      const cached = cache.get<RelatedQueries>(cacheKey);
      if (cached) {
        setState(set, 'relatedQueries', { data: cached, status: 'success', error: undefined });
        return;
      }
    }
    setState(set, 'relatedQueries', { status: 'loading', error: undefined });
    try {
      const data = await apiClient.relatedQueries(params);
      cache.set(cacheKey, data, 'related');
      setState(set, 'relatedQueries', { data, status: 'success' });
    } catch (error) {
      setState(set, 'relatedQueries', {
        status: 'error',
        error: error instanceof Error ? error.message : 'Failed to load related queries',
      });
    }
  },
  fetchRelatedTopics: async (params) => {
    const cacheKey = buildCacheKey('related', params);
    const cache = useCacheStore.getState();
    if (!params.no_cache) {
      const cached = cache.get<RelatedTopics>(cacheKey);
      if (cached) {
        setState(set, 'relatedTopics', { data: cached, status: 'success', error: undefined });
        return;
      }
    }
    setState(set, 'relatedTopics', { status: 'loading', error: undefined });
    try {
      const data = await apiClient.relatedTopics(params);
      cache.set(cacheKey, data, 'related');
      setState(set, 'relatedTopics', { data, status: 'success' });
    } catch (error) {
      setState(set, 'relatedTopics', {
        status: 'error',
        error: error instanceof Error ? error.message : 'Failed to load related topics',
      });
    }
  },
  fetchTrendingNow: async (params) => {
    const cacheKey = buildCacheKey('trending_now', params);
    const cache = useCacheStore.getState();
    if (!params.no_cache) {
      const cached = cache.get<TrendingNowData>(cacheKey);
      if (cached) {
        setState(set, 'trendingNow', { data: cached, status: 'success', error: undefined });
        return;
      }
    }
    setState(set, 'trendingNow', { status: 'loading', error: undefined });
    try {
      const data = await apiClient.trendingNow(params);
      cache.set(cacheKey, data, 'trending_now');
      setState(set, 'trendingNow', { data, status: 'success' });
    } catch (error) {
      setState(set, 'trendingNow', {
        status: 'error',
        error: error instanceof Error ? error.message : 'Failed to load trending now',
      });
    }
  },
  fetchNewsTrends: async (params) => {
    const cacheKey = buildCacheKey('news', params);
    const cache = useCacheStore.getState();
    if (!params.no_cache) {
      const cached = cache.get<NewsTrendsData>(cacheKey);
      if (cached) {
        setState(set, 'newsTrends', { data: cached, status: 'success', error: undefined });
        return;
      }
    }
    setState(set, 'newsTrends', { status: 'loading', error: undefined });
    try {
      const data = await apiClient.newsTrends(params);
      cache.set(cacheKey, data, 'news');
      setState(set, 'newsTrends', { data, status: 'success' });
    } catch (error) {
      setState(set, 'newsTrends', {
        status: 'error',
        error: error instanceof Error ? error.message : 'Failed to load news trends',
      });
    }
  },
  fetchShoppingTrends: async (params) => {
    const cacheKey = buildCacheKey('shopping', params);
    const cache = useCacheStore.getState();
    if (!params.no_cache) {
      const cached = cache.get<ShoppingTrendsData>(cacheKey);
      if (cached) {
        setState(set, 'shoppingTrends', { data: cached, status: 'success', error: undefined });
        return;
      }
    }
    setState(set, 'shoppingTrends', { status: 'loading', error: undefined });
    try {
      const data = await apiClient.shoppingTrends(params);
      cache.set(cacheKey, data, 'shopping');
      setState(set, 'shoppingTrends', { data, status: 'success' });
    } catch (error) {
      setState(set, 'shoppingTrends', {
        status: 'error',
        error: error instanceof Error ? error.message : 'Failed to load shopping trends',
      });
    }
  },
  fetchComprehensiveReport: async (params) => {
    const cacheKey = buildCacheKey('report', params);
    const cache = useCacheStore.getState();
    if (!params.no_cache) {
      const cached = cache.get<TrendReport>(cacheKey);
      if (cached) {
        setState(set, 'comprehensiveReport', { data: cached, status: 'success', error: undefined });
        return;
      }
    }
    setState(set, 'comprehensiveReport', { status: 'loading', error: undefined });
    try {
      const data = await apiClient.comprehensiveReport(params);
      cache.set(cacheKey, data, 'report');
      setState(set, 'comprehensiveReport', { data, status: 'success' });
    } catch (error) {
      setState(set, 'comprehensiveReport', {
        status: 'error',
        error: error instanceof Error ? error.message : 'Failed to load report',
      });
    }
  },
  clearErrors: () =>
    set((state) => ({
      ...state,
      interestOverTime: { ...state.interestOverTime, error: undefined },
      interestByRegion: { ...state.interestByRegion, error: undefined },
      comparedByRegion: { ...state.comparedByRegion, error: undefined },
      relatedQueries: { ...state.relatedQueries, error: undefined },
      relatedTopics: { ...state.relatedTopics, error: undefined },
      trendingNow: { ...state.trendingNow, error: undefined },
      newsTrends: { ...state.newsTrends, error: undefined },
      shoppingTrends: { ...state.shoppingTrends, error: undefined },
      comprehensiveReport: { ...state.comprehensiveReport, error: undefined },
    })),
}));
