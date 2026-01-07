import TrendingNowPanel from '@/components/dashboard/TrendingNowPanel';
import TimeSeriesChart from '@/components/charts/TimeSeriesChart';
import { useTrendAnalysis } from '@/hooks/useTrendAnalysis';
import ErrorAlert from '@/components/feedback/ErrorAlert';
import LoadingSpinner from '@/components/feedback/LoadingSpinner';

const DASHBOARD_QUERIES = ['ai'];

export default function Dashboard() {
  const {
    data: timeSeries,
    loading: timeSeriesLoading,
    error: timeSeriesError,
    refetch,
  } = useTrendAnalysis({
    queries: DASHBOARD_QUERIES,
    dateRange: 'today 3-m',
    geo: 'KR',
    autoFetch: false,
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4">
        <span className="text-xs uppercase tracking-[0.3em] text-ink-700/60">Dashboard</span>
        <h1 className="text-3xl font-semibold text-ink-900 md:text-4xl">
          Real-time trend orchestration
        </h1>
        <p className="max-w-xl text-sm text-ink-700/80">
          Watch the web signal field, cross-check shopping momentum, and build reports without
          friction. The platform is tuned for quick synthesis, not noise.
        </p>
      </div>

      <div className="rounded-3xl border border-ink-700/10 bg-white/70 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-ink-900">Search pulse</h2>
            <p className="mt-1 text-xs text-ink-700/70">
              Interest over time snapshot for {DASHBOARD_QUERIES.join(', ')}
            </p>
          </div>
          <button
            className="rounded-full border border-ink-700/20 bg-white px-4 py-2 text-xs font-semibold text-ink-900"
            type="button"
            onClick={() => void refetch()}
          >
            Refresh
          </button>
        </div>
        <div className="mt-4">
          {timeSeriesLoading ? (
            <LoadingSpinner label="Loading trend snapshot..." />
          ) : (
            <TimeSeriesChart data={timeSeries ?? undefined} height={220} />
          )}
          {timeSeriesError && (
            <div className="mt-3">
              <ErrorAlert message={timeSeriesError} />
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-3xl border border-ink-700/10 bg-white/70 p-6">
          <h2 className="text-lg font-semibold text-ink-900">Pulse timeline</h2>
          <div className="mt-4 h-48 rounded-2xl border border-dashed border-ink-700/20 bg-white/60 p-4 text-sm text-ink-700/70">
            Chart placeholder · connect to interest-over-time feed
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-ink-700/10 bg-paper/80 p-4 text-xs text-ink-700/70">
              Next ingestion window: 4 minutes
            </div>
            <div className="rounded-2xl border border-ink-700/10 bg-paper/80 p-4 text-xs text-ink-700/70">
              Cache health: 92% hit rate
            </div>
          </div>
        </div>
        <TrendingNowPanel />
      </div>
    </div>
  );
}
