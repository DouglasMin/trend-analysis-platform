export type GoogleTrendsDataType =
  | 'TIMESERIES'
  | 'GEO_MAP_0'
  | 'GEO_MAP'
  | 'RELATED_QUERIES'
  | 'RELATED_TOPICS';

export type TrendProperty = 'images' | 'news' | 'youtube' | 'froogle';

export interface GoogleTrendsParams {
  engine: 'google_trends';
  q: string;
  data_type: GoogleTrendsDataType;
  date?: string;
  geo?: string;
  hl?: string;
  cat?: string;
  gprop?: TrendProperty;
}

export interface TrendingNowParams {
  engine: 'google_trends_trending_now';
  geo?: string;
  hl?: string;
  frequency?: 'realtime' | 'daily';
}

export interface GoogleTrendsNewsParams {
  engine: 'google_trends_news';
  news_page_token?: string;
  geo?: string;
  hl?: string;
}

export interface GoogleNewsSearchParams {
  engine: 'google';
  q: string;
  tbm: 'nws';
  tbs?: string;
  start?: number;
  hl?: string;
  gl?: string;
  location?: string;
}

export interface GoogleShoppingParams {
  engine: 'google_shopping';
  q: string;
  location?: string;
  hl?: string;
  gl?: string;
}

export type SearchParams =
  | GoogleTrendsParams
  | TrendingNowParams
  | GoogleTrendsNewsParams
  | GoogleNewsSearchParams
  | GoogleShoppingParams;
