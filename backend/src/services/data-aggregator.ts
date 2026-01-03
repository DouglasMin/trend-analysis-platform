import type {
  Correlation,
  NewsTrendsData,
  RegionalData,
  ShoppingTrendsData,
  TimeSeriesData,
  TrendMetrics,
  TrendReport,
  TrendSource,
} from '../types/index.js';
import type { SerpAPIClient } from './serpapi-client.js';
import {
  parseInterestByRegion,
  parseInterestOverTime,
  parseNewsTrends,
  parseShoppingTrends,
  parseTrendingNow,
} from './serpapi-parser.js';

export interface ComprehensiveReportOptions {
  query: string;
  includeNews?: boolean;
  includeShopping?: boolean;
  includeTrendingNow?: boolean;
  geo?: string;
  date?: string;
}

export class DataAggregator {
  private readonly client: SerpAPIClient;

  constructor(client: SerpAPIClient) {
    this.client = client;
  }

  async generateComprehensiveReport(options: ComprehensiveReportOptions): Promise<TrendReport> {
    const tasks: Promise<TrendSourceResult>[] = [];

    tasks.push(this.fetchTimeSeries(options));
    tasks.push(this.fetchRegional(options));

    if (options.includeNews) {
      tasks.push(this.fetchNews(options));
    }

    if (options.includeShopping) {
      tasks.push(this.fetchShopping(options));
    }

    if (options.includeTrendingNow) {
      tasks.push(this.fetchTrendingNow(options));
    }

    const results = await Promise.all(tasks);
    const report: TrendReport = {
      query: options.query,
      generatedAt: new Date().toISOString(),
    };

    results.forEach((result) => {
      switch (result.source) {
        case 'google_trends':
          if (result.payload) {
            report.timeSeries = result.payload as TimeSeriesData;
          }
          if (result.regional) {
            report.regional = result.regional as RegionalData;
          }
          break;
        case 'news':
          report.news = result.payload as NewsTrendsData;
          break;
        case 'shopping':
          report.shopping = result.payload as ShoppingTrendsData;
          break;
        case 'trending_now':
          report.trendingNow = result.payload as TrendReport['trendingNow'];
          break;
        default:
          break;
      }
    });

    report.metrics = this.calculateMetrics(report.timeSeries);
    report.correlations = this.identifyCorrelations(report);

    return report;
  }

  private async fetchTimeSeries(
    options: ComprehensiveReportOptions,
  ): Promise<TrendSourceResult> {
    const data = await this.client.search({
      engine: 'google_trends',
      q: options.query,
      data_type: 'TIMESERIES',
      date: options.date,
      geo: options.geo,
    });
    return { source: 'google_trends', payload: parseInterestOverTime(data) };
  }

  private async fetchRegional(
    options: ComprehensiveReportOptions,
  ): Promise<TrendSourceResult> {
    const data = await this.client.search({
      engine: 'google_trends',
      q: options.query,
      data_type: 'GEO_MAP_0',
      date: options.date,
      geo: options.geo,
    });
    return {
      source: 'google_trends',
      payload: undefined,
      regional: parseInterestByRegion(data),
    };
  }

  private async fetchNews(options: ComprehensiveReportOptions): Promise<TrendSourceResult> {
    const data = await this.client.search({
      engine: 'google',
      q: options.query,
      tbm: 'nws',
      hl: 'en',
    });
    return { source: 'news', payload: parseNewsTrends(data) };
  }

  private async fetchShopping(
    options: ComprehensiveReportOptions,
  ): Promise<TrendSourceResult> {
    const data = await this.client.search({
      engine: 'google_shopping',
      q: options.query,
      hl: 'en',
    });
    return { source: 'shopping', payload: parseShoppingTrends(data) };
  }

  private async fetchTrendingNow(
    options: ComprehensiveReportOptions,
  ): Promise<TrendSourceResult> {
    const data = await this.client.search({
      engine: 'google_trends_trending_now',
      geo: options.geo,
      hl: 'en',
      frequency: 'realtime',
    });
    return { source: 'trending_now', payload: parseTrendingNow(data) };
  }

  private calculateMetrics(timeSeries?: TimeSeriesData): TrendMetrics | undefined {
    if (!timeSeries || timeSeries.series.length === 0) return undefined;

    const values = timeSeries.series.flatMap((series) => series.data.map((point) => point.value));
    if (values.length === 0) return undefined;

    const averageInterest = values.reduce((sum, value) => sum + value, 0) / values.length;
    const peakInterest = Math.max(...values);
    const growthRate = values.length > 1 ? (values[values.length - 1] - values[0]) / values[0] : 0;
    const mean = averageInterest;
    const variance =
      values.reduce((sum, value) => sum + (value - mean) ** 2, 0) / values.length;
    const volatility = Math.sqrt(variance);

    return {
      averageInterest,
      peakInterest,
      growthRate: Number.isFinite(growthRate) ? growthRate : 0,
      volatility,
    };
  }

  private identifyCorrelations(report: TrendReport): Correlation[] {
    const correlations: Correlation[] = [];
    if (report.timeSeries && report.news) {
      correlations.push(this.buildCorrelation('google_trends', 'news', 0.3));
    }
    if (report.timeSeries && report.shopping) {
      correlations.push(this.buildCorrelation('google_trends', 'shopping', 0.25));
    }
    if (report.news && report.shopping) {
      correlations.push(this.buildCorrelation('news', 'shopping', 0.2));
    }
    return correlations;
  }

  private buildCorrelation(sourceA: TrendSource, sourceB: TrendSource, coefficient: number): Correlation {
    return { sourceA, sourceB, coefficient };
  }
}

interface TrendSourceResult {
  source: TrendSource;
  payload?: unknown;
  regional?: RegionalData;
}
