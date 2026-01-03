import type { TimeSeriesData } from '@/types/trend';

export interface ChartSeriesRow {
  timestamp: number;
  label: string;
  values: Record<string, number>;
}

const fallbackColors = [
  '#1f2937',
  '#f97316',
  '#10b981',
  '#0ea5e9',
  '#f43f5e',
  '#8b5cf6',
];

export function getSeriesColor(index: number): string {
  return fallbackColors[index % fallbackColors.length];
}

export function buildTimeSeriesRows(data?: TimeSeriesData): ChartSeriesRow[] {
  if (!data || !data.series.length) return [];
  const byTimestamp = new Map<number, ChartSeriesRow>();

  data.series.forEach((series) => {
    series.data.forEach((point) => {
      const existing = byTimestamp.get(point.timestamp);
      const label = point.formattedTime ?? new Date(point.timestamp * 1000).toLocaleDateString();
      if (existing) {
        existing.values[series.query] = point.value;
        return;
      }
      byTimestamp.set(point.timestamp, {
        timestamp: point.timestamp,
        label,
        values: { [series.query]: point.value },
      });
    });
  });

  return Array.from(byTimestamp.values()).sort((a, b) => a.timestamp - b.timestamp);
}

export function flattenRows(rows: ChartSeriesRow[]): Array<Record<string, number | string>> {
  return rows.map((row) => ({
    timestamp: row.timestamp,
    label: row.label,
    ...row.values,
  }));
}
