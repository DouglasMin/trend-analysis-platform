import { useCallback, useEffect, useMemo } from 'react';
import { useTrendsStore } from '@/stores/useTrendsStore';
import type { TrendReport } from '@/types/trend';

export interface UseComprehensiveReportOptions {
  queries: string[];
  dateRange?: string;
  includeNews?: boolean;
  includeShopping?: boolean;
  includeTrendingNow?: boolean;
  noCache?: boolean;
  autoGenerate?: boolean;
}

export interface UseComprehensiveReportReturn {
  report: TrendReport | null;
  loading: boolean;
  error: string | null;
  generate: () => Promise<void>;
}

function normalizeQueries(queries: string[]): string[] {
  return queries.map((query) => query.trim()).filter(Boolean);
}

export function useComprehensiveReport(
  options: UseComprehensiveReportOptions
): UseComprehensiveReportReturn {
  const {
    queries,
    dateRange,
    includeNews = false,
    includeShopping = false,
    includeTrendingNow = false,
    noCache,
    autoGenerate = false,
  } = options;
  const state = useTrendsStore((store) => store.comprehensiveReport);
  const fetchComprehensiveReport = useTrendsStore(
    (store) => store.fetchComprehensiveReport
  );

  const normalizedQueries = useMemo(() => normalizeQueries(queries), [queries]);
  const params = useMemo(() => {
    const q = normalizedQueries.join(',');
    if (!q) return null;
    return {
      q,
      date: dateRange,
      include_news: includeNews,
      include_shopping: includeShopping,
      include_trending_now: includeTrendingNow,
      no_cache: noCache || undefined,
    };
  }, [normalizedQueries, dateRange, includeNews, includeShopping, includeTrendingNow, noCache]);

  const generate = useCallback(async () => {
    if (!params) return;
    await fetchComprehensiveReport(params);
  }, [fetchComprehensiveReport, params]);

  useEffect(() => {
    if (!autoGenerate) return;
    if (!params) return;
    void generate();
  }, [autoGenerate, params, generate]);

  return {
    report: state.data ?? null,
    loading: state.status === 'loading',
    error: state.error ?? null,
    generate,
  };
}
