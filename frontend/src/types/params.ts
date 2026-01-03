export type GoogleTrendsDataType =
  | 'TIMESERIES'
  | 'GEO_MAP_0'
  | 'GEO_MAP'
  | 'RELATED_QUERIES'
  | 'RELATED_TOPICS';

export type TrendProperty = 'images' | 'news' | 'youtube' | 'froogle';

export interface BaseQueryParams {
  no_cache?: boolean;
}

export interface GoogleTrendsParams extends BaseQueryParams {
  q: string;
  date?: string;
  geo?: string;
  hl?: string;
  cat?: string;
  gprop?: TrendProperty;
}

export interface TrendingNowParams extends BaseQueryParams {
  geo?: string;
  hl?: string;
  frequency?: 'realtime' | 'daily';
}

export interface NewsTrendsParams extends BaseQueryParams {
  news_page_token?: string;
  q?: string;
  tbs?: string;
  start?: number;
  hl?: string;
  gl?: string;
  location?: string;
  geo?: string;
}

export interface ShoppingTrendsParams extends BaseQueryParams {
  q: string;
  location?: string;
  hl?: string;
  gl?: string;
}

export interface ComprehensiveReportParams extends BaseQueryParams {
  q: string;
  date?: string;
  geo?: string;
  include_news?: boolean;
  include_shopping?: boolean;
  include_trending_now?: boolean;
}
