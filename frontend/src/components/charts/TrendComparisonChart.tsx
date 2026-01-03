import { useMemo, useState } from 'react';
import {
  Brush,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
} from 'recharts';
import type { TimeSeriesData } from '@/types/trend';
import { buildTimeSeriesRows, flattenRows, getSeriesColor } from './utils';

interface TrendComparisonChartProps {
  data?: TimeSeriesData;
  height?: number;
}

const rangeOptions = [
  { label: 'All', value: 'all' },
  { label: 'Last 90', value: '90' },
  { label: 'Last 30', value: '30' },
];

export default function TrendComparisonChart({ data, height = 320 }: TrendComparisonChartProps) {
  const [range, setRange] = useState<'all' | '90' | '30'>('all');
  const rows = buildTimeSeriesRows(data);
  const chartData = useMemo(() => {
    const flattened = flattenRows(rows);
    if (range === 'all') return flattened;
    const limit = Number(range);
    return flattened.slice(Math.max(0, flattened.length - limit));
  }, [range, rows]);

  const series = data?.series ?? [];

  if (!series.length) {
    return (
      <div className="rounded-2xl border border-dashed border-ink-700/20 bg-white/60 p-6 text-sm text-ink-700/70">
        No comparison data yet.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-ink-700/10 bg-white/70 p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs uppercase tracking-[0.25em] text-ink-700/60">Trend comparison</p>
        <div className="flex gap-2">
          {rangeOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                range === option.value
                  ? 'bg-ink-900 text-paper'
                  : 'border border-ink-700/20 bg-white text-ink-900'
              }`}
              onClick={() => setRange(option.value as 'all' | '90' | '30')}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={chartData}>
          <XAxis dataKey="label" tickLine={false} axisLine={false} />
          <YAxis tickLine={false} axisLine={false} />
          <Tooltip />
          <Legend />
          {series.map((seriesItem, index) => (
            <Line
              key={seriesItem.query}
              type="monotone"
              dataKey={seriesItem.query}
              stroke={getSeriesColor(index)}
              strokeWidth={2}
              dot={false}
            />
          ))}
          <Brush dataKey="label" height={24} stroke="#1f2937" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
