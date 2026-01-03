export type TrendSource = 'google_trends' | 'trending_now' | 'news' | 'shopping';

export interface TimeSeriesPoint {
  timestamp: number;
  value: number;
  formattedTime?: string;
}

export interface TimeSeriesSeries {
  query: string;
  data: TimeSeriesPoint[];
}

export interface TimeSeriesData {
  timeframe?: string;
  series: TimeSeriesSeries[];
}

export interface RegionalValue {
  location: string;
  geoCode: string;
  value: number;
}

export interface RegionalSeries {
  query: string;
  values: RegionalValue[];
}

export interface RegionalData {
  series: RegionalSeries[];
}

export interface RelatedQuery {
  query: string;
  value: number;
  extractedValue?: number;
  link?: string;
  growthPercentage?: number;
}

export interface RelatedQueries {
  top: RelatedQuery[];
  rising: RelatedQuery[];
}

export interface RelatedTopic {
  title: string;
  type: string;
  value: number;
  extractedValue?: number;
  link?: string;
  growthPercentage?: number;
}

export interface RelatedTopics {
  top: RelatedTopic[];
  rising: RelatedTopic[];
}

export interface TrendingStory {
  title: string;
  link: string;
  source: string;
  snippet?: string;
  date?: string;
  newsPageToken?: string;
}

export interface TrendingNowData {
  stories: TrendingStory[];
  geo?: string;
}

export interface NewsArticle {
  title: string;
  link: string;
  source: string;
  date?: string;
  snippet?: string;
}

export interface NewsTrendsData {
  articles: NewsArticle[];
  nextPageToken?: string;
}

export interface ShoppingFilter {
  name: string;
  values: string[];
}

export interface ShoppingTrendItem {
  title: string;
  link: string;
  source?: string;
  price?: string;
  extractedPrice?: number;
  originalPrice?: string;
  rating?: number;
  reviews?: number;
  shipping?: string;
  thumbnail?: string;
}

export interface ShoppingTrendsData {
  items: ShoppingTrendItem[];
  filters?: ShoppingFilter[];
}

export interface TrendMetrics {
  averageInterest: number;
  peakInterest: number;
  growthRate: number;
  volatility: number;
}

export interface Correlation {
  sourceA: TrendSource;
  sourceB: TrendSource;
  coefficient: number;
}

export interface TrendReport {
  query: string;
  generatedAt: string;
  timeSeries?: TimeSeriesData;
  regional?: RegionalData;
  relatedQueries?: RelatedQueries;
  relatedTopics?: RelatedTopics;
  trendingNow?: TrendingNowData;
  news?: NewsTrendsData;
  shopping?: ShoppingTrendsData;
  metrics?: TrendMetrics;
  correlations?: Correlation[];
}
