import { useEffect, useState } from 'react';
import { useTrendsStore } from '@/stores/useTrendsStore';

export default function ShoppingTrendsPanel() {
  const [query, setQuery] = useState('wireless earbuds');
  const [location, setLocation] = useState('');
  const [hl, setHl] = useState('ko');
  const [gl, setGl] = useState('KR');
  const [noCache, setNoCache] = useState(false);

  const shoppingTrends = useTrendsStore((state) => state.shoppingTrends);
  const fetchShoppingTrends = useTrendsStore((state) => state.fetchShoppingTrends);

  useEffect(() => {
    void fetchShoppingTrends({
      q: query,
      location: location || undefined,
      hl: hl || undefined,
      gl: gl || undefined,
      no_cache: noCache || undefined,
    });
  }, [fetchShoppingTrends, gl, hl, location, noCache, query]);

  return (
    <div className="space-y-6">
      <div>
        <span className="text-xs uppercase tracking-[0.3em] text-ink-700/60">Shopping Radar</span>
        <h2 className="mt-3 text-2xl font-semibold text-ink-900">Commerce signals</h2>
        <p className="mt-2 text-sm text-ink-700/80">
          Blend purchase intent with trend velocity to surface product opportunities.
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
            Location
            <input
              className="w-full rounded-xl border border-ink-700/10 bg-white px-3 py-2 text-sm text-ink-900"
              value={location}
              onChange={(event) => setLocation(event.target.value)}
              placeholder="Seoul, South Korea"
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
          <label className="flex items-center gap-2 text-xs text-ink-700/70">
            <input
              type="checkbox"
              checked={noCache}
              onChange={(event) => setNoCache(event.target.checked)}
            />
            Skip cache
          </label>
        </div>
        <div className="mt-4">
          <button
            className="rounded-full bg-ink-900 px-5 py-2 text-xs font-semibold text-paper"
            type="button"
            onClick={() => {
              void fetchShoppingTrends({
                q: query,
                location: location || undefined,
                hl: hl || undefined,
                gl: gl || undefined,
                no_cache: noCache || undefined,
              });
            }}
          >
            Fetch shopping trends
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {shoppingTrends.status === 'loading' && (
          <div className="rounded-2xl border border-ink-700/10 bg-white/70 p-5 text-sm text-ink-700/70">
            Loading shopping results...
          </div>
        )}
        {shoppingTrends.status !== 'loading' && shoppingTrends.data?.items.length === 0 && (
          <div className="rounded-2xl border border-ink-700/10 bg-white/70 p-5 text-sm text-ink-700/70">
            No shopping results yet.
          </div>
        )}
        {shoppingTrends.data?.items.map((item) => (
          <div
            key={item.link}
            className="rounded-2xl border border-ink-700/10 bg-white/70 p-5"
          >
            <p className="text-sm font-semibold text-ink-900">{item.title}</p>
            <p className="mt-2 text-xs text-ink-700/60">{item.source}</p>
            <p className="mt-4 text-sm text-ink-900">{item.price ?? 'Price n/a'}</p>
            {item.rating !== undefined && (
              <p className="mt-2 text-xs text-ink-700/70">
                Rating {item.rating} · {item.reviews ?? 0} reviews
              </p>
            )}
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-ink-700/10 bg-paper/80 p-5 text-sm text-ink-700/70">
        {shoppingTrends.data?.filters?.length
          ? `Filters available: ${shoppingTrends.data.filters.length}`
          : 'No filters available.'}
      </div>
    </div>
  );
}
