import { useEffect, useMemo, useState } from 'react';
import { useComprehensiveReport } from '@/hooks/useComprehensiveReport';
import { useDataExport } from '@/hooks/useDataExport';
import TimeSeriesChart from '@/components/charts/TimeSeriesChart';
import RegionalMap from '@/components/charts/RegionalMap';
import RelatedInsightsChart, { type RelatedInsightItem } from '@/components/charts/RelatedInsightsChart';

export default function ComprehensiveReportView() {
  const [query, setQuery] = useState('ai');
  const [dateRange, setDateRange] = useState('today 12-m');
  const [includeNews, setIncludeNews] = useState(true);
  const [includeShopping, setIncludeShopping] = useState(true);
  const [includeTrendingNow, setIncludeTrendingNow] = useState(false);
  const [noCache, setNoCache] = useState(false);

  const { report, loading, error, generate } = useComprehensiveReport({
    queries: [query],
    dateRange,
    includeNews,
    includeShopping,
    includeTrendingNow,
    noCache,
  });
  const { exportReport } = useDataExport();

  useEffect(() => {
    void generate();
  }, [generate]);

  const sections = [
    {
      title: 'Interest Over Time',
      available: Boolean(report?.timeSeries?.series.length),
    },
    {
      title: 'Regional Distribution',
      available: Boolean(report?.regional?.series.length),
    },
    {
      title: 'Related Queries',
      available: Boolean(report?.relatedQueries?.top.length),
    },
    {
      title: 'Related Topics',
      available: Boolean(report?.relatedTopics?.top.length),
    },
    {
      title: 'Trending Now',
      available: Boolean(report?.trendingNow?.stories.length),
    },
    {
      title: 'News + Shopping',
      available: Boolean(report?.news?.articles.length || report?.shopping?.items.length),
    },
  ];

  const relatedQueryItems: RelatedInsightItem[] = useMemo(
    () => [
      ...(report?.relatedQueries?.top.slice(0, 5).map((item) => ({
        label: item.query,
        value: item.value,
        category: 'top' as const,
      })) ?? []),
      ...(report?.relatedQueries?.rising.slice(0, 5).map((item) => ({
        label: item.query,
        value: item.value,
        category: 'rising' as const,
      })) ?? []),
    ],
    [report?.relatedQueries]
  );

  const relatedTopicItems: RelatedInsightItem[] = useMemo(
    () => [
      ...(report?.relatedTopics?.top.slice(0, 5).map((item) => ({
        label: item.title,
        value: item.value,
        category: 'top' as const,
      })) ?? []),
      ...(report?.relatedTopics?.rising.slice(0, 5).map((item) => ({
        label: item.title,
        value: item.value,
        category: 'rising' as const,
      })) ?? []),
    ],
    [report?.relatedTopics]
  );

  return (
    <div className="space-y-6">
      <div>
        <span className="text-xs uppercase tracking-[0.3em] text-ink-700/60">Reports</span>
        <h2 className="mt-3 text-2xl font-semibold text-ink-900">Comprehensive briefs</h2>
        <p className="mt-2 text-sm text-ink-700/80">
          Assemble multi-source summaries and export for internal strategy reviews.
        </p>
      </div>

      <div className="rounded-2xl border border-ink-700/10 bg-white/70 p-5">
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          <label className="space-y-2 text-xs text-ink-700/70">
            Query
            <input
              className="w-full rounded-xl border border-ink-700/10 bg-white px-3 py-2 text-sm text-ink-900"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>
          <label className="space-y-2 text-xs text-ink-700/70">
            Date Range
            <input
              className="w-full rounded-xl border border-ink-700/10 bg-white px-3 py-2 text-sm text-ink-900"
              value={dateRange}
              onChange={(event) => setDateRange(event.target.value)}
            />
          </label>
          <label className="flex items-center gap-2 text-xs text-ink-700/70">
            <input
              type="checkbox"
              checked={includeNews}
              onChange={(event) => setIncludeNews(event.target.checked)}
            />
            Include news
          </label>
          <label className="flex items-center gap-2 text-xs text-ink-700/70">
            <input
              type="checkbox"
              checked={includeShopping}
              onChange={(event) => setIncludeShopping(event.target.checked)}
            />
            Include shopping
          </label>
          <label className="flex items-center gap-2 text-xs text-ink-700/70">
            <input
              type="checkbox"
              checked={includeTrendingNow}
              onChange={(event) => setIncludeTrendingNow(event.target.checked)}
            />
            Include trending now
          </label>
          <label className="flex items-center gap-2 text-xs text-ink-700/70">
            <input
              type="checkbox"
              checked={noCache}
              onChange={(event) => setNoCache(event.target.checked)}
            />
            Skip cache
          </label>
        </div>
        <div className="mt-4 flex flex-wrap gap-3">
          <button
            className="rounded-full bg-ink-900 px-5 py-2 text-xs font-semibold text-paper"
            type="button"
            onClick={() => void generate()}
          >
            Generate report
          </button>
          {report && (
            <>
              <button
                className="rounded-full border border-ink-700/20 bg-white px-5 py-2 text-xs font-semibold text-ink-900"
                type="button"
                onClick={() => exportReport(report, 'json')}
              >
                Export JSON
              </button>
              <button
                className="rounded-full border border-ink-700/20 bg-white px-5 py-2 text-xs font-semibold text-ink-900"
                type="button"
                onClick={() => exportReport(report, 'csv')}
              >
                Export CSV
              </button>
            </>
          )}
          {error && <span className="text-xs text-accent-500">{error}</span>}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {sections.map((section) => (
          <div
            key={section.title}
            className="rounded-2xl border border-ink-700/10 bg-white/70 p-5"
          >
            <p className="text-sm font-semibold text-ink-900">{section.title}</p>
            <p className="mt-2 text-xs text-ink-700/60">
              Status: {loading ? 'Generating' : section.available ? 'Ready' : 'Pending'}
            </p>
          </div>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
        <div>
          <p className="mb-3 text-xs uppercase tracking-[0.25em] text-ink-700/60">Time Series</p>
          <TimeSeriesChart data={report?.timeSeries} />
        </div>
        <div>
          <p className="mb-3 text-xs uppercase tracking-[0.25em] text-ink-700/60">Regional Map</p>
          <RegionalMap data={report?.regional} />
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <RelatedInsightsChart title="Related Queries" items={relatedQueryItems} />
        <RelatedInsightsChart title="Related Topics" items={relatedTopicItems} />
      </div>

      <div className="rounded-2xl border border-ink-700/10 bg-ink-900 px-5 py-4 text-xs text-paper/80">
        {report ? `Report generated at ${report.generatedAt}` : 'Generate a report to enable exports.'}
      </div>
    </div>
  );
}
