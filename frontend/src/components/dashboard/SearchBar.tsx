import { useMemo, useState } from 'react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit?: (queries: string[]) => void;
  maxQueries?: number;
  placeholder?: string;
  submitMode?: 'button' | 'submit';
}

function parseQueries(raw: string): string[] {
  return raw
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

export default function SearchBar({
  value,
  onChange,
  onSubmit,
  maxQueries = 5,
  placeholder = 'ai, robotics',
  submitMode = 'button',
}: SearchBarProps) {
  const [touched, setTouched] = useState(false);
  const queries = useMemo(() => parseQueries(value), [value]);

  const error = useMemo(() => {
    if (!touched) return '';
    if (queries.length === 0) return 'Enter at least one query.';
    if (queries.length > maxQueries) return `Use up to ${maxQueries} queries.`;
    return '';
  }, [maxQueries, queries, touched]);

  return (
    <div className="space-y-2">
      <label className="text-xs uppercase tracking-[0.25em] text-ink-700/60">Queries</label>
      <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-ink-700/10 bg-white px-4 py-3">
        <input
          className="flex-1 bg-transparent text-sm text-ink-900 outline-none"
          value={value}
          onChange={(event) => {
            onChange(event.target.value);
            if (!touched) setTouched(true);
          }}
          placeholder={placeholder}
          onBlur={() => setTouched(true)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault();
              if (submitMode === 'button') {
                onSubmit?.(queries);
              }
            }
          }}
        />
        <button
          className="rounded-full bg-ink-900 px-4 py-2 text-xs font-semibold text-paper"
          type={submitMode === 'submit' ? 'submit' : 'button'}
          onClick={() => {
            if (submitMode === 'button') onSubmit?.(queries);
          }}
        >
          Analyze
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {queries.map((query) => (
          <span
            key={query}
            className="rounded-full border border-ink-700/10 bg-paper/80 px-3 py-1 text-xs text-ink-700"
          >
            {query}
          </span>
        ))}
      </div>
      {error && <p className="text-xs text-accent-500">{error}</p>}
    </div>
  );
}
