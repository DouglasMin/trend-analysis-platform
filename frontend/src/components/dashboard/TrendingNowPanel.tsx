import { useState } from 'react';
import { useTrendsStore } from '@/stores/useTrendsStore';
import ErrorAlert from '@/components/feedback/ErrorAlert';
import LoadingSpinner from '@/components/feedback/LoadingSpinner';

export default function TrendingNowPanel() {
  const [geo, setGeo] = useState('KR');
  const [hl, setHl] = useState('ko');
  const [frequency, setFrequency] = useState<'realtime' | 'daily'>('daily');
  const [noCache, setNoCache] = useState(false);

  const trendingNow = useTrendsStore((state) => state.trendingNow);
  const fetchTrendingNow = useTrendsStore((state) => state.fetchTrendingNow);

  return (
    <div className="rounded-3xl border border-ink-700/10 bg-ink-900 p-6 text-paper">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Trending now</h2>
          <p className="mt-1 text-xs text-paper/70">Live Google Trends stories</p>
        </div>
        <button
          className="rounded-full border border-paper/20 px-4 py-2 text-xs font-semibold text-paper"
          type="button"
          onClick={() => void fetchTrendingNow({ geo, hl, frequency, no_cache: noCache || undefined })}
        >
          Refresh
        </button>
      </div>

      <form
        className="mt-4 grid gap-3 md:grid-cols-3"
        onSubmit={(event) => {
          event.preventDefault();
          void fetchTrendingNow({ geo, hl, frequency, no_cache: noCache || undefined });
        }}
      >
        <label className="space-y-2 text-xs text-paper/70">
          Geo
          <input
            className="w-full rounded-xl border border-paper/20 bg-transparent px-3 py-2 text-sm text-paper"
            value={geo}
            onChange={(event) => setGeo(event.target.value)}
          />
        </label>
        <label className="space-y-2 text-xs text-paper/70">
          Language (hl)
          <input
            className="w-full rounded-xl border border-paper/20 bg-transparent px-3 py-2 text-sm text-paper"
            value={hl}
            onChange={(event) => setHl(event.target.value)}
          />
        </label>
        <label className="space-y-2 text-xs text-paper/70">
          Frequency
          <select
            className="w-full rounded-xl border border-paper/20 bg-ink-900 px-3 py-2 text-sm text-paper"
            value={frequency}
            onChange={(event) => setFrequency(event.target.value as 'realtime' | 'daily')}
          >
            <option value="realtime">Realtime</option>
            <option value="daily">Daily</option>
          </select>
        </label>
        <label className="flex items-center gap-2 text-xs text-paper/70">
          <input
            type="checkbox"
            checked={noCache}
            onChange={(event) => setNoCache(event.target.checked)}
          />
          Skip cache
        </label>
      </form>

      <div className="mt-5 space-y-3">
        {trendingNow.status === 'loading' && <LoadingSpinner label="Loading trending stories..." />}
        {trendingNow.error && (
          <ErrorAlert
            title="Trending now error"
            message={trendingNow.error}
          />
        )}
        {trendingNow.status !== 'loading' && trendingNow.data?.stories.length === 0 && (
          <div className="rounded-2xl bg-white/10 px-4 py-3 text-xs text-paper/70">
            No trending stories available.
          </div>
        )}
        {trendingNow.data?.stories.slice(0, 6).map((story) => (
          <div
            key={story.link}
            className="flex items-center justify-between rounded-2xl bg-white/10 px-4 py-3"
          >
            <div>
              <p className="text-sm font-semibold">{story.title}</p>
              <p className="text-xs text-paper/70">{story.source}</p>
            </div>
            <span className="rounded-full bg-accent-500/20 px-3 py-1 text-xs text-accent-500">
              {story.date ?? 'Trending'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
