import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { RegionalData } from '@/types/trend';

interface RegionalMapProps {
  data?: RegionalData;
  maxItems?: number;
  height?: number;
}

export default function RegionalMap({ data, maxItems = 8, height = 280 }: RegionalMapProps) {
  const series = data?.series?.[0];
  const values = series?.values ?? [];
  const chartData = values
    .slice(0, maxItems)
    .map((item) => ({ location: item.location, value: item.value }));

  if (!chartData.length) {
    return (
      <div className="rounded-2xl border border-dashed border-ink-700/20 bg-paper/60 p-6 text-sm text-ink-700/70">
        No regional data yet.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-ink-700/10 bg-paper/80 p-5">
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={chartData} layout="vertical" margin={{ left: 20 }}>
          <XAxis type="number" tickLine={false} axisLine={false} />
          <YAxis dataKey="location" type="category" tickLine={false} axisLine={false} />
          <Tooltip />
          <Bar dataKey="value" fill="#1f2937" radius={[6, 6, 6, 6]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
