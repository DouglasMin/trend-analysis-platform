import type {
  NewsTrendsData,
  RegionalData,
  RelatedQueries,
  RelatedTopics,
  ShoppingTrendsData,
  TimeSeriesData,
  TrendReport,
  TrendingNowData,
} from '@/types/trend';

export interface UseDataExportReturn {
  exportToJSON: (data: unknown, filename: string) => void;
  exportToCSV: (data: TimeSeriesData | RegionalData | RegionalData[], filename: string) => void;
  exportReport: (report: TrendReport, format: 'json' | 'csv') => void;
}

function ensureExtension(filename: string, extension: string): string {
  if (filename.toLowerCase().endsWith(extension)) return filename;
  return `${filename}${extension}`;
}

function escapeCsvValue(value: unknown): string {
  if (value === null || value === undefined) return '';
  const stringValue = String(value);
  const needsEscape = /[",\n]/.test(stringValue);
  const escaped = stringValue.replace(/"/g, '""');
  return needsEscape ? `"${escaped}"` : escaped;
}

function rowsToCsv(rows: Array<Array<unknown>>): string {
  return rows
    .map((row) => row.map(escapeCsvValue).join(','))
    .join('\n');
}

function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

function isTimeSeriesData(data: TimeSeriesData | RegionalData): data is TimeSeriesData {
  return data.series.some((series) => Array.isArray((series as { data?: unknown }).data));
}

function buildTimeSeriesRows(data: TimeSeriesData): Array<Array<unknown>> {
  const rows: Array<Array<unknown>> = [['timestamp', 'query', 'value']];
  data.series.forEach((series) => {
    series.data.forEach((point) => {
      rows.push([point.timestamp, series.query, point.value]);
    });
  });
  return rows;
}

function buildRegionalRows(data: RegionalData): Array<Array<unknown>> {
  const rows: Array<Array<unknown>> = [['query', 'location', 'geoCode', 'value']];
  data.series.forEach((series) => {
    series.values.forEach((value) => {
      rows.push([series.query, value.location, value.geoCode, value.value]);
    });
  });
  return rows;
}

function buildRelatedQueriesRows(related: RelatedQueries): Array<Array<unknown>> {
  const rows: Array<Array<unknown>> = [
    ['section', 'type', 'query', 'value', 'growthPercentage', 'link'],
  ];
  related.top.forEach((item) => {
    rows.push(['relatedQueries', 'top', item.query, item.value, item.growthPercentage, item.link]);
  });
  related.rising.forEach((item) => {
    rows.push([
      'relatedQueries',
      'rising',
      item.query,
      item.value,
      item.growthPercentage,
      item.link,
    ]);
  });
  return rows;
}

function buildRelatedTopicsRows(related: RelatedTopics): Array<Array<unknown>> {
  const rows: Array<Array<unknown>> = [
    ['section', 'type', 'title', 'topicType', 'value', 'growthPercentage', 'link'],
  ];
  related.top.forEach((item) => {
    rows.push([
      'relatedTopics',
      'top',
      item.title,
      item.type,
      item.value,
      item.growthPercentage,
      item.link,
    ]);
  });
  related.rising.forEach((item) => {
    rows.push([
      'relatedTopics',
      'rising',
      item.title,
      item.type,
      item.value,
      item.growthPercentage,
      item.link,
    ]);
  });
  return rows;
}

function buildTrendingNowRows(data: TrendingNowData): Array<Array<unknown>> {
  const rows: Array<Array<unknown>> = [
    ['section', 'title', 'source', 'date', 'link', 'snippet'],
  ];
  data.stories.forEach((story) => {
    rows.push(['trendingNow', story.title, story.source, story.date, story.link, story.snippet]);
  });
  return rows;
}

function buildNewsRows(data: NewsTrendsData): Array<Array<unknown>> {
  const rows: Array<Array<unknown>> = [
    ['section', 'title', 'source', 'date', 'link', 'snippet'],
  ];
  data.articles.forEach((article) => {
    rows.push([
      'news',
      article.title,
      article.source,
      article.date,
      article.link,
      article.snippet,
    ]);
  });
  return rows;
}

function buildShoppingRows(data: ShoppingTrendsData): Array<Array<unknown>> {
  const rows: Array<Array<unknown>> = [
    [
      'section',
      'title',
      'source',
      'price',
      'extractedPrice',
      'rating',
      'reviews',
      'shipping',
      'link',
    ],
  ];
  data.items.forEach((item) => {
    rows.push([
      'shopping',
      item.title,
      item.source,
      item.price,
      item.extractedPrice,
      item.rating,
      item.reviews,
      item.shipping,
      item.link,
    ]);
  });
  return rows;
}

function buildMetricsRows(report: TrendReport): Array<Array<unknown>> {
  if (!report.metrics) return [];
  return [
    ['section', 'averageInterest', 'peakInterest', 'growthRate', 'volatility'],
    [
      'metrics',
      report.metrics.averageInterest,
      report.metrics.peakInterest,
      report.metrics.growthRate,
      report.metrics.volatility,
    ],
  ];
}

function buildCorrelationsRows(report: TrendReport): Array<Array<unknown>> {
  if (!report.correlations || report.correlations.length === 0) return [];
  const rows: Array<Array<unknown>> = [
    ['section', 'sourceA', 'sourceB', 'coefficient'],
  ];
  report.correlations.forEach((correlation) => {
    rows.push([
      'correlations',
      correlation.sourceA,
      correlation.sourceB,
      correlation.coefficient,
    ]);
  });
  return rows;
}

export function useDataExport(): UseDataExportReturn {
  const exportToJSON = (data: unknown, filename: string): void => {
    const content = JSON.stringify(data, null, 2);
    downloadFile(content, ensureExtension(filename, '.json'), 'application/json');
  };

  const exportToCSV = (
    data: TimeSeriesData | RegionalData | RegionalData[],
    filename: string
  ): void => {
    const datasets = Array.isArray(data) ? data : [data];
    const rows: Array<Array<unknown>> = [];

    datasets.forEach((dataset, index) => {
      if (index > 0) rows.push([]);
      if (isTimeSeriesData(dataset)) {
        rows.push(...buildTimeSeriesRows(dataset));
      } else {
        rows.push(...buildRegionalRows(dataset));
      }
    });

    downloadFile(rowsToCsv(rows), ensureExtension(filename, '.csv'), 'text/csv');
  };

  const exportReport = (report: TrendReport, format: 'json' | 'csv'): void => {
    if (format === 'json') {
      exportToJSON(report, `${report.query}-report`);
      return;
    }

    const sections: string[] = [];

    if (report.timeSeries) {
      const rows: Array<Array<unknown>> = [['section', 'timestamp', 'query', 'value']];
      report.timeSeries.series.forEach((series) => {
        series.data.forEach((point) => {
          rows.push(['timeSeries', point.timestamp, series.query, point.value]);
        });
      });
      sections.push(rowsToCsv(rows));
    }

    if (report.regional) {
      const rows: Array<Array<unknown>> = [['section', 'query', 'location', 'geoCode', 'value']];
      report.regional.series.forEach((series) => {
        series.values.forEach((value) => {
          rows.push(['regional', series.query, value.location, value.geoCode, value.value]);
        });
      });
      sections.push(rowsToCsv(rows));
    }

    if (report.relatedQueries) {
      sections.push(rowsToCsv(buildRelatedQueriesRows(report.relatedQueries)));
    }

    if (report.relatedTopics) {
      sections.push(rowsToCsv(buildRelatedTopicsRows(report.relatedTopics)));
    }

    if (report.trendingNow) {
      sections.push(rowsToCsv(buildTrendingNowRows(report.trendingNow)));
    }

    if (report.news) {
      sections.push(rowsToCsv(buildNewsRows(report.news)));
    }

    if (report.shopping) {
      sections.push(rowsToCsv(buildShoppingRows(report.shopping)));
    }

    const metricsRows = buildMetricsRows(report);
    if (metricsRows.length > 0) {
      sections.push(rowsToCsv(metricsRows));
    }

    const correlationRows = buildCorrelationsRows(report);
    if (correlationRows.length > 0) {
      sections.push(rowsToCsv(correlationRows));
    }

    const content = sections.filter(Boolean).join('\n\n');
    const filename = ensureExtension(`${report.query}-report`, '.csv');
    downloadFile(content, filename, 'text/csv');
  };

  return {
    exportToJSON,
    exportToCSV,
    exportReport,
  };
}
