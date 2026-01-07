import {
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

interface TimeSeriesChartProps {
  data?: TimeSeriesData | null;
  height?: number;
}

export default function TimeSeriesChart({ data, height = 280 }: TimeSeriesChartProps) {
  const rows = buildTimeSeriesRows(data);
  const chartData = flattenRows(rows);
  const series = data?.series ?? [];

  if (!series.length) {
    return (
      <div className="rounded-2xl border border-dashed border-ink-700/20 bg-white/60 p-6 text-sm text-ink-700/70">
        No time series data yet.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-ink-700/10 bg-white/70 p-5">
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
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
