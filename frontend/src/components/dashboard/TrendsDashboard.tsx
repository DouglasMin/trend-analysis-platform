import { useMemo, useState } from 'react';
import { useTrendAnalysis } from '@/hooks/useTrendAnalysis';
import { useTrendsStore } from '@/stores/useTrendsStore';
import type { TrendProperty } from '@/types/params';
import SearchBar from './SearchBar';
import FilterPanel from './FilterPanel';
import TimeSeriesChart from '@/components/charts/TimeSeriesChart';
import RegionalMap from '@/components/charts/RegionalMap';
import RelatedInsightsChart, { type RelatedInsightItem } from '@/components/charts/RelatedInsightsChart';
import TrendComparisonChart from '@/components/charts/TrendComparisonChart';
import ErrorAlert from '@/components/feedback/ErrorAlert';
import LoadingSpinner from '@/components/feedback/LoadingSpinner';

export default function TrendsDashboard() {
  const [queryInput, setQueryInput] = useState('ai, robotics');
  const [dateRange, setDateRange] = useState('today 12-m');
  const [geo, setGeo] = useState('KR');
  const [category, setCategory] = useState('');
  const [propertyFilter, setPropertyFilter] = useState<TrendProperty | ''>('');
  const [noCache, setNoCache] = useState(false);

  const queries = useMemo(
    () => queryInput.split(',').map((item) => item.trim()).filter(Boolean),
    [queryInput]
  );

  const { data: timeSeries, loading: timeSeriesLoading, error: timeSeriesError, refetch } =
    useTrendAnalysis({
      queries,
      dateRange,
      geo: geo || undefined,
      category: category ? Number(category) : undefined,
      propertyFilter: propertyFilter || undefined,
      noCache,
    });

  const interestByRegion = useTrendsStore((state) => state.interestByRegion);
  const comparedByRegion = useTrendsStore((state) => state.comparedByRegion);
  const relatedQueries = useTrendsStore((state) => state.relatedQueries);
  const relatedTopics = useTrendsStore((state) => state.relatedTopics);

  const fetchInterestByRegion = useTrendsStore((state) => state.fetchInterestByRegion);
  const fetchComparedByRegion = useTrendsStore((state) => state.fetchComparedByRegion);
  const fetchRelatedQueries = useTrendsStore((state) => state.fetchRelatedQueries);
  const fetchRelatedTopics = useTrendsStore((state) => state.fetchRelatedTopics);

  const requestParams = useMemo(() => {
    const q = queries.join(',');
    if (!q) return null;
    return {
      q,
      date: dateRange || undefined,
      geo: geo || undefined,
      cat: category || undefined,
      gprop: propertyFilter || undefined,
      no_cache: noCache || undefined,
    };
  }, [queries, dateRange, geo, category, propertyFilter, noCache]);

  const comparedTop = comparedByRegion.data?.series[0]?.values.slice(0, 5) ?? [];

  const relatedQueryItems: RelatedInsightItem[] = [
    ...(relatedQueries.data?.top.slice(0, 5).map((item) => ({
      label: item.query,
      value: item.value,
      category: 'top' as const,
    })) ?? []),
    ...(relatedQueries.data?.rising.slice(0, 5).map((item) => ({
      label: item.query,
      value: item.value,
      category: 'rising' as const,
    })) ?? []),
  ];

  const relatedTopicItems: RelatedInsightItem[] = [
    ...(relatedTopics.data?.top.slice(0, 5).map((item) => ({
      label: item.title,
      value: item.value,
      category: 'top' as const,
    })) ?? []),
    ...(relatedTopics.data?.rising.slice(0, 5).map((item) => ({
      label: item.title,
      value: item.value,
      category: 'rising' as const,
    })) ?? []),
  ];

  return (
    <div className="space-y-6">
      <div>
        <span className="text-xs uppercase tracking-[0.3em] text-ink-700/60">Trends</span>
        <h1 className="mt-3 text-3xl font-semibold text-ink-900">Interest over time</h1>
        <p className="mt-2 text-sm text-ink-700/80">
          Compare up to 5 queries and track their curve across regions and categories.
        </p>
      </div>

      <form
        className="space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
          if (!requestParams) return;
          void refetch();
          void fetchInterestByRegion(requestParams);
          void fetchComparedByRegion(requestParams);
          void fetchRelatedQueries(requestParams);
          void fetchRelatedTopics(requestParams);
        }}
      >
        <SearchBar
          value={queryInput}
          onChange={setQueryInput}
          onSubmit={() => {
            if (!requestParams) return;
            void refetch();
            void fetchInterestByRegion(requestParams);
            void fetchComparedByRegion(requestParams);
            void fetchRelatedQueries(requestParams);
            void fetchRelatedTopics(requestParams);
          }}
          submitMode="submit"
        />
        <FilterPanel
          dateRange={dateRange}
          geo={geo}
          category={category}
          propertyFilter={propertyFilter}
          noCache={noCache}
          onDateRangeChange={setDateRange}
          onGeoChange={setGeo}
          onCategoryChange={setCategory}
          onPropertyFilterChange={setPropertyFilter}
          onNoCacheChange={setNoCache}
        />
        {timeSeriesError && (
          <ErrorAlert title="Time series error" message={timeSeriesError} />
        )}
      </form>

      <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-2xl border border-ink-700/10 bg-white/70 p-5">
          <p className="text-xs uppercase tracking-[0.25em] text-ink-700/60">Interest Over Time</p>
          <div className="mt-4">
            {timeSeriesLoading ? (
              <LoadingSpinner label="Loading time series..." />
            ) : (
              <TimeSeriesChart data={timeSeries} />
            )}
          </div>
        </div>
        <div className="rounded-2xl border border-ink-700/10 bg-paper/80 p-5">
          <p className="text-xs uppercase tracking-[0.25em] text-ink-700/60">Regional Breakout</p>
          <div className="mt-4">
            {interestByRegion.status === 'loading' ? (
              <LoadingSpinner label="Loading regional data..." />
            ) : (
              <RegionalMap data={interestByRegion.data} />
            )}
            {interestByRegion.error && (
              <div className="mt-3">
                <ErrorAlert title="Regional data error" message={interestByRegion.error} />
              </div>
            )}
          </div>
          <div className="mt-4 border-t border-ink-700/10 pt-4">
            <p className="text-xs uppercase tracking-[0.25em] text-ink-700/60">Compared Regions</p>
            <div className="mt-3 space-y-2 text-sm text-ink-700/70">
              {comparedByRegion.status === 'loading' && 'Loading compared regions...'}
              {comparedByRegion.status !== 'loading' && comparedTop.length === 0 && (
                <span>No compared region data yet.</span>
              )}
              {comparedTop.map((value) => (
                <div key={`${value.geoCode}-${value.location}`} className="flex justify-between">
                  <span>{value.location}</span>
                  <span className="text-ink-900">{value.value}</span>
                </div>
              ))}
            </div>
            {comparedByRegion.error && (
              <div className="mt-3">
                <ErrorAlert title="Compared regions error" message={comparedByRegion.error} />
              </div>
            )}
          </div>
        </div>
      </div>

      <TrendComparisonChart data={timeSeries} />

      <div className="grid gap-5 lg:grid-cols-2">
        <div>
          {relatedQueries.status === 'loading' ? (
            <LoadingSpinner label="Loading related queries..." />
          ) : (
            <RelatedInsightsChart title="Related Queries" items={relatedQueryItems} />
          )}
          {relatedQueries.error && (
            <div className="mt-3">
              <ErrorAlert title="Related queries error" message={relatedQueries.error} />
            </div>
          )}
        </div>
        <div>
          {relatedTopics.status === 'loading' ? (
            <LoadingSpinner label="Loading related topics..." />
          ) : (
            <RelatedInsightsChart title="Related Topics" items={relatedTopicItems} />
          )}
          {relatedTopics.error && (
            <div className="mt-3">
              <ErrorAlert title="Related topics error" message={relatedTopics.error} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
