import { useCallback, useEffect, useMemo } from 'react';
import { useTrendsStore } from '@/stores/useTrendsStore';
import type { TrendProperty } from '@/types/params';
import type { TimeSeriesData } from '@/types/trend';

export interface UseTrendAnalysisOptions {
  queries: string[];
  dateRange?: string;
  geo?: string;
  category?: number;
  propertyFilter?: TrendProperty;
  noCache?: boolean;
  autoFetch?: boolean;
}

export interface UseTrendAnalysisReturn {
  data: TimeSeriesData | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

function normalizeQueries(queries: string[]): string[] {
  return queries.map((query) => query.trim()).filter(Boolean);
}

export function useTrendAnalysis(options: UseTrendAnalysisOptions): UseTrendAnalysisReturn {
  const {
    queries,
    dateRange,
    geo,
    category,
    propertyFilter,
    noCache,
    autoFetch = false,
  } = options;
  const state = useTrendsStore((store) => store.interestOverTime);
  const fetchInterestOverTime = useTrendsStore((store) => store.fetchInterestOverTime);

  const normalizedQueries = useMemo(() => normalizeQueries(queries), [queries]);
  const params = useMemo(() => {
    const q = normalizedQueries.join(',');
    if (!q) return null;
    return {
      q,
      date: dateRange,
      geo,
      cat: category !== undefined ? String(category) : undefined,
      gprop: propertyFilter,
      no_cache: noCache || undefined,
    };
  }, [normalizedQueries, dateRange, geo, category, propertyFilter, noCache]);

  const refetch = useCallback(async () => {
    if (!params) return;
    await fetchInterestOverTime(params);
  }, [fetchInterestOverTime, params]);

  useEffect(() => {
    if (!autoFetch) return;
    if (!params) return;
    void refetch();
  }, [autoFetch, params, refetch]);

  return {
    data: state.data ?? null,
    loading: state.status === 'loading',
    error: state.error ?? null,
    refetch,
  };
}
