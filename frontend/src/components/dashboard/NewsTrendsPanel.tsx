import { useState } from 'react';
import { useTrendsStore } from '@/stores/useTrendsStore';
import ErrorAlert from '@/components/feedback/ErrorAlert';
import LoadingSpinner from '@/components/feedback/LoadingSpinner';

export default function NewsTrendsPanel() {
  const [query, setQuery] = useState('ai');
  const [timeFilter, setTimeFilter] = useState('qdr:d');
  const [hl, setHl] = useState('ko');
  const [gl, setGl] = useState('KR');
  const [location, setLocation] = useState('');
  const [geo, setGeo] = useState('KR');
  const [start, setStart] = useState('');
  const [noCache, setNoCache] = useState(false);

  const newsTrends = useTrendsStore((state) => state.newsTrends);
  const fetchNewsTrends = useTrendsStore((state) => state.fetchNewsTrends);

  return (
    <div className="space-y-6">
      <div>
        <span className="text-xs uppercase tracking-[0.3em] text-ink-700/60">News Pulse</span>
        <h2 className="mt-3 text-2xl font-semibold text-ink-900">Media momentum</h2>
        <p className="mt-2 text-sm text-ink-700/80">
          Track headlines tied to trend shifts, clustered by topic and sentiment.
        </p>
      </div>

      <form
        className="rounded-2xl border border-ink-700/10 bg-white/70 p-5"
        onSubmit={(event) => {
          event.preventDefault();
          void fetchNewsTrends({
            q: query,
            tbs: timeFilter || undefined,
            start: start ? Number(start) : undefined,
            hl,
            gl,
            location: location || undefined,
            geo: geo || undefined,
            no_cache: noCache || undefined,
          });
        }}
      >
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
            Time Filter
            <select
              className="w-full rounded-xl border border-ink-700/10 bg-white px-3 py-2 text-sm text-ink-900"
              value={timeFilter}
              onChange={(event) => setTimeFilter(event.target.value)}
            >
              <option value="">Any</option>
              <option value="qdr:h">Past hour</option>
              <option value="qdr:d">Past day</option>
              <option value="qdr:w">Past week</option>
              <option value="qdr:m">Past month</option>
              <option value="qdr:y">Past year</option>
            </select>
          </label>
          <label className="space-y-2 text-xs text-ink-700/70">
            Geo
            <input
              className="w-full rounded-xl border border-ink-700/10 bg-white px-3 py-2 text-sm text-ink-900"
              value={geo}
              onChange={(event) => setGeo(event.target.value)}
            />
          </label>
          <label className="space-y-2 text-xs text-ink-700/70">
            Language (hl)
            <input
              className="w-full rounded-xl border border-ink-700/10 bg-white px-3 py-2 text-sm text-ink-900"
              value={hl}
              onChange={(event) => setHl(event.target.value)}
            />
          </label>
          <label className="space-y-2 text-xs text-ink-700/70">
            Country (gl)
            <input
              className="w-full rounded-xl border border-ink-700/10 bg-white px-3 py-2 text-sm text-ink-900"
              value={gl}
              onChange={(event) => setGl(event.target.value)}
            />
          </label>
          <label className="space-y-2 text-xs text-ink-700/70">
            Location (optional)
            <input
              className="w-full rounded-xl border border-ink-700/10 bg-white px-3 py-2 text-sm text-ink-900"
              value={location}
              onChange={(event) => setLocation(event.target.value)}
            />
          </label>
          <label className="space-y-2 text-xs text-ink-700/70">
            Start (optional)
            <input
              className="w-full rounded-xl border border-ink-700/10 bg-white px-3 py-2 text-sm text-ink-900"
              value={start}
              onChange={(event) => setStart(event.target.value)}
              placeholder="0"
            />
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
            type="submit"
          >
            Fetch news
          </button>
          {newsTrends.data?.nextPageToken && (
            <button
              className="rounded-full border border-ink-700/20 bg-white px-5 py-2 text-xs font-semibold text-ink-900"
              type="button"
              onClick={() => {
                void fetchNewsTrends({
                  news_page_token: newsTrends.data?.nextPageToken,
                  geo: geo || undefined,
                  hl: hl || undefined,
                  no_cache: noCache || undefined,
                });
              }}
            >
              Load next page
            </button>
          )}
        </div>
      </form>

      <div className="grid gap-4 md:grid-cols-3">
        {newsTrends.status === 'loading' && <LoadingSpinner label="Loading news..." />}
        {newsTrends.error && (
          <ErrorAlert title="News error" message={newsTrends.error} />
        )}
        {newsTrends.status !== 'loading' && newsTrends.data?.articles.length === 0 && (
          <div className="rounded-2xl border border-ink-700/10 bg-white/70 p-5 text-sm text-ink-700/70">
            No news articles yet.
          </div>
        )}
        {newsTrends.data?.articles.map((article) => (
          <article
            key={article.link}
            className="rounded-2xl border border-ink-700/10 bg-white/70 p-5"
          >
            <p className="text-sm font-semibold text-ink-900">{article.title}</p>
            <p className="mt-2 text-xs text-ink-700/60">{article.snippet}</p>
            <div className="mt-3 flex items-center justify-between text-xs text-ink-700/70">
              <span>{article.source}</span>
              <span>{article.date ?? 'Latest'}</span>
            </div>
          </article>
        ))}
      </div>

      <div className="rounded-2xl border border-ink-700/10 bg-paper/80 p-5 text-sm text-ink-700/70">
        {newsTrends.data?.nextPageToken
          ? 'Next page token available.'
          : 'No additional pages available.'}
      </div>
    </div>
  );
}
