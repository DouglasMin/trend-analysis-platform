import type { TrendProperty } from '@/types/params';

interface FilterPanelProps {
  dateRange: string;
  geo: string;
  category: string;
  propertyFilter: TrendProperty | '';
  noCache: boolean;
  onDateRangeChange: (value: string) => void;
  onGeoChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onPropertyFilterChange: (value: TrendProperty | '') => void;
  onNoCacheChange: (value: boolean) => void;
}

export default function FilterPanel({
  dateRange,
  geo,
  category,
  propertyFilter,
  noCache,
  onDateRangeChange,
  onGeoChange,
  onCategoryChange,
  onPropertyFilterChange,
  onNoCacheChange,
}: FilterPanelProps) {
  return (
    <div className="rounded-2xl border border-ink-700/10 bg-white/70 p-5">
      <p className="text-xs uppercase tracking-[0.25em] text-ink-700/60">Filters</p>
      <div className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        <label className="space-y-2 text-xs text-ink-700/70">
          Date Range
          <input
            className="w-full rounded-xl border border-ink-700/10 bg-white px-3 py-2 text-sm text-ink-900"
            value={dateRange}
            onChange={(event) => onDateRangeChange(event.target.value)}
            placeholder="today 12-m"
          />
        </label>
        <label className="space-y-2 text-xs text-ink-700/70">
          Geo
          <input
            className="w-full rounded-xl border border-ink-700/10 bg-white px-3 py-2 text-sm text-ink-900"
            value={geo}
            onChange={(event) => onGeoChange(event.target.value)}
            placeholder="KR"
          />
        </label>
        <label className="space-y-2 text-xs text-ink-700/70">
          Category
          <input
            className="w-full rounded-xl border border-ink-700/10 bg-white px-3 py-2 text-sm text-ink-900"
            value={category}
            onChange={(event) => onCategoryChange(event.target.value)}
            placeholder="0"
          />
        </label>
        <label className="space-y-2 text-xs text-ink-700/70">
          Property
          <select
            className="w-full rounded-xl border border-ink-700/10 bg-white px-3 py-2 text-sm text-ink-900"
            value={propertyFilter}
            onChange={(event) => onPropertyFilterChange(event.target.value as TrendProperty | '')}
          >
            <option value="">All</option>
            <option value="images">Images</option>
            <option value="news">News</option>
            <option value="youtube">YouTube</option>
            <option value="froogle">Shopping</option>
          </select>
        </label>
        <label className="flex items-center gap-2 text-xs text-ink-700/70">
          <input
            type="checkbox"
            checked={noCache}
            onChange={(event) => onNoCacheChange(event.target.checked)}
          />
          Skip cache
        </label>
      </div>
    </div>
  );
}
