import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

export interface RelatedInsightItem {
  label: string;
  value: number;
  category: 'top' | 'rising';
}

interface RelatedInsightsChartProps {
  title: string;
  items: RelatedInsightItem[];
  height?: number;
}

export default function RelatedInsightsChart({
  title,
  items,
  height = 260,
}: RelatedInsightsChartProps) {
  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-ink-700/20 bg-white/60 p-6 text-sm text-ink-700/70">
        No {title.toLowerCase()} yet.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-ink-700/10 bg-white/70 p-5">
      <p className="text-xs uppercase tracking-[0.25em] text-ink-700/60">{title}</p>
      <div className="mt-3">
        <ResponsiveContainer width="100%" height={height}>
          <BarChart data={items} layout="vertical" margin={{ left: 20 }}>
            <XAxis type="number" tickLine={false} axisLine={false} />
            <YAxis dataKey="label" type="category" tickLine={false} axisLine={false} width={120} />
            <Tooltip />
            <Bar dataKey="value" fill="#0ea5e9" radius={[6, 6, 6, 6]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
