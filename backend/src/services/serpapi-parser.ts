import type {
  NewsTrendsData,
  RelatedQueries,
  RelatedTopics,
  RegionalData,
  RegionalSeries,
  RegionalValue,
  ShoppingFilter,
  ShoppingTrendItem,
  ShoppingTrendsData,
  TimeSeriesData,
  TimeSeriesSeries,
  TrendingNowData,
  TrendingStory,
} from '../types/index.js';

type UnknownRecord = Record<string, unknown>;

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function toNumber(value: unknown): number | undefined {
  if (typeof value === 'number') return value;
  if (typeof value !== 'string') return undefined;
  const cleaned = value.replace(/[%+,]/g, '').trim();
  if (!cleaned) return undefined;
  const parsed = Number.parseFloat(cleaned);
  return Number.isNaN(parsed) ? undefined : parsed;
}

function toString(value: unknown): string | undefined {
  return typeof value === 'string' ? value : undefined;
}

function extractSearchQuery(root: UnknownRecord): string | undefined {
  const searchParams =
    (root.search_parameters as UnknownRecord | undefined) ??
    (root.searchParameters as UnknownRecord | undefined);
  return toString(searchParams?.q);
}

export function parseInterestOverTime(response: unknown): TimeSeriesData {
  const root = response as UnknownRecord;
  const interest =
    (root.interest_over_time as UnknownRecord | undefined) ??
    (root.interestOverTime as UnknownRecord | undefined);
  const timeline = asArray(interest?.timeline_data ?? interest?.timelineData);

  const seriesMap = new Map<string, TimeSeriesSeries>();
  timeline.forEach((entry, index) => {
    const item = entry as UnknownRecord;
    const date = toString(item.date);
    const timestamp =
      (typeof item.timestamp === 'number' && item.timestamp) ||
      (typeof item.time === 'number' && item.time) ||
      (date ? Date.parse(date) : NaN) ||
      index;
    const values = asArray(item.values);
    values.forEach((value) => {
      const valueItem = value as UnknownRecord;
      const query = toString(valueItem.query);
      if (!query) return;
      const pointValue = toNumber(
        valueItem.extracted_value ?? valueItem.extractedValue ?? valueItem.value,
      );
      if (pointValue === undefined) return;
      const series = seriesMap.get(query) ?? { query, data: [] };
      series.data.push({ timestamp, value: pointValue, formattedTime: date });
      seriesMap.set(query, series);
    });
  });

  return {
    timeframe: toString(interest?.timeframe),
    series: Array.from(seriesMap.values()),
  };
}

export function parseInterestByRegion(response: unknown): RegionalData {
  const root = response as UnknownRecord;
  const raw =
    (root.interest_by_region as UnknownRecord | unknown[] | undefined) ??
    (root.interestByRegion as UnknownRecord | unknown[] | undefined);

  const series: RegionalSeries[] = [];
  const queryFromSearch = extractSearchQuery(root);

  const pushSeries = (query: string | undefined, data: unknown[]): void => {
    const values: RegionalValue[] = [];
    data.forEach((entry) => {
      const item = entry as UnknownRecord;
      const value = toNumber(item.extracted_value ?? item.extractedValue ?? item.value);
      if (value === undefined) return;
      values.push({
        location: toString(item.location) ?? '',
        geoCode: toString(item.geo) ?? '',
        value,
      });
    });
    series.push({
      query: query ?? '',
      values,
    });
  };

  if (Array.isArray(raw)) {
    pushSeries(queryFromSearch, raw);
    return { series };
  }

  if (raw && typeof raw === 'object') {
    const rawQuery = toString((raw as UnknownRecord).query) ?? queryFromSearch;
    if ('data' in raw && Array.isArray((raw as UnknownRecord).data)) {
      pushSeries(rawQuery, (raw as UnknownRecord).data as unknown[]);
      return { series };
    }
    const entries = Object.values(raw as UnknownRecord);
    entries.forEach((entry) => {
      const entryObj = entry as UnknownRecord;
      if (!entryObj) return;
      if (!Array.isArray(entryObj.data)) return;
      const query = toString(entryObj.query) ?? rawQuery;
      pushSeries(query, entryObj.data);
    });
  }

  return { series };
}

export function parseComparedBreakdownByRegion(response: unknown): RegionalData {
  const root = response as UnknownRecord;
  const raw =
    (root.compared_breakdown_by_region as unknown[] | undefined) ??
    (root.comparedByRegion as unknown[] | undefined);
  const seriesMap = new Map<string, RegionalSeries>();

  asArray(raw).forEach((entry) => {
    const item = entry as UnknownRecord;
    const location = toString(item.location) ?? '';
    const geoCode = toString(item.geo) ?? '';
    const values = asArray(item.values);
    values.forEach((value) => {
      const valueItem = value as UnknownRecord;
      const query = toString(valueItem.query);
      if (!query) return;
      const numberValue = toNumber(
        valueItem.extracted_value ?? valueItem.extractedValue ?? valueItem.value,
      );
      if (numberValue === undefined) return;
      const series = seriesMap.get(query) ?? { query, values: [] };
      series.values.push({ location, geoCode, value: numberValue });
      seriesMap.set(query, series);
    });
  });

  return { series: Array.from(seriesMap.values()) };
}

export function parseRelatedQueries(response: unknown): RelatedQueries {
  const root = response as UnknownRecord;
  const raw = (root.related_queries ?? root.relatedQueries) as unknown;
  const top: RelatedQueries['top'] = [];
  const rising: RelatedQueries['rising'] = [];

  const parseItems = (items: unknown[], target: RelatedQueries['top']): void => {
    items.forEach((entry) => {
      const item = entry as UnknownRecord;
      const query = toString(item.query);
      if (!query) return;
      const extractedValue = toNumber(item.extracted_value ?? item.extractedValue);
      const value = toNumber(item.value) ?? extractedValue ?? 0;
      const rawValue = toString(item.value);
      const growthPercentage =
        rawValue && rawValue.includes('%') ? extractedValue ?? toNumber(rawValue) : undefined;
      target.push({
        query,
        value,
        extractedValue: extractedValue ?? undefined,
        link: toString(item.link) ?? undefined,
        growthPercentage,
      });
    });
  };

  if (Array.isArray(raw)) {
    raw.forEach((group) => {
      const groupObj = group as UnknownRecord;
      parseItems(asArray(groupObj.top), top);
      parseItems(asArray(groupObj.rising), rising);
    });
  } else if (raw && typeof raw === 'object') {
    const rawObj = raw as UnknownRecord;
    parseItems(asArray(rawObj.top), top);
    parseItems(asArray(rawObj.rising), rising);
  }

  return { top, rising };
}

export function parseRelatedTopics(response: unknown): RelatedTopics {
  const root = response as UnknownRecord;
  const raw = (root.related_topics ?? root.relatedTopics) as unknown;
  const top: RelatedTopics['top'] = [];
  const rising: RelatedTopics['rising'] = [];

  const parseItems = (items: unknown[], target: RelatedTopics['top']): void => {
    items.forEach((entry) => {
      const item = entry as UnknownRecord;
      const topic = (item.topic ?? {}) as UnknownRecord;
      const title = toString(topic.title) ?? toString(item.title);
      const type = toString(topic.type) ?? toString(item.type);
      if (!title || !type) return;
      const extractedValue = toNumber(item.extracted_value ?? item.extractedValue);
      const value = toNumber(item.value) ?? extractedValue ?? 0;
      const rawValue = toString(item.value);
      const growthPercentage =
        rawValue && rawValue.includes('%') ? extractedValue ?? toNumber(rawValue) : undefined;
      target.push({
        title,
        type,
        value,
        extractedValue: extractedValue ?? undefined,
        link: toString(item.link) ?? undefined,
        growthPercentage,
      });
    });
  };

  if (Array.isArray(raw)) {
    raw.forEach((group) => {
      const groupObj = group as UnknownRecord;
      parseItems(asArray(groupObj.top), top);
      parseItems(asArray(groupObj.rising), rising);
    });
  } else if (raw && typeof raw === 'object') {
    const rawObj = raw as UnknownRecord;
    parseItems(asArray(rawObj.top), top);
    parseItems(asArray(rawObj.rising), rising);
  }

  return { top, rising };
}

export function parseTrendingNow(response: unknown): TrendingNowData {
  const root = response as UnknownRecord;
  const stories: TrendingStory[] = [];

  const trending = asArray(root.trending_searches ?? root.trendingSearches);
  trending.forEach((entry) => {
    const item = entry as UnknownRecord;
    const title = toString(item.query);
    if (!title) return;
    const link =
      toString(item.serpapi_news_link) ??
      toString(item.serpapi_google_trends_link) ??
      toString(item.google_trends_link) ??
      '';
    stories.push({
      title,
      link,
      source: '',
      snippet: undefined,
      date: undefined,
      newsPageToken: toString(item.news_page_token) ?? undefined,
    });
  });

  const dailySearches = asArray(root.daily_searches ?? root.dailySearches);
  dailySearches.forEach((entry) => {
    const item = entry as UnknownRecord;
    const searches = asArray(item.searches);
    searches.forEach((search) => {
      const searchItem = search as UnknownRecord;
      const articles = asArray(searchItem.articles);
      articles.forEach((article) => {
        const articleItem = article as UnknownRecord;
        const title = toString(articleItem.title);
        const link = toString(articleItem.link);
        if (!title || !link) return;
        stories.push({
          title,
          link,
          source: toString(articleItem.source) ?? '',
          snippet: toString(articleItem.snippet) ?? undefined,
          date: toString(articleItem.date) ?? undefined,
        });
      });
    });
  });

  return {
    stories,
    geo: toString(root.search_parameters ? (root.search_parameters as UnknownRecord).geo : undefined),
  };
}

export function parseNewsTrends(response: unknown): NewsTrendsData {
  const root = response as UnknownRecord;
  const articles: NewsTrendsData['articles'] = [];

  const rawArticles = asArray(root.news_results ?? root.newsResults ?? root.articles);
  rawArticles.forEach((entry) => {
    const item = entry as UnknownRecord;
    const title = toString(item.title);
    const link = toString(item.link);
    if (!title || !link) return;
    articles.push({
      title,
      link,
      source: toString(item.source) ?? '',
      date: toString(item.date) ?? undefined,
      snippet: toString(item.snippet) ?? undefined,
    });
  });

  const pagination =
    (root.serpapi_pagination as UnknownRecord | undefined) ??
    (root.pagination as UnknownRecord | undefined);
  const nextPageToken =
    toString(pagination?.next_page_token) ?? toString(pagination?.next) ?? undefined;

  return { articles, nextPageToken };
}

export function parseShoppingTrends(response: unknown): ShoppingTrendsData {
  const root = response as UnknownRecord;
  const items: ShoppingTrendItem[] = [];

  const rawItems = asArray(root.shopping_results ?? root.shoppingResults);
  rawItems.forEach((entry) => {
    const item = entry as UnknownRecord;
    const title = toString(item.title);
    const link = toString(item.link);
    if (!title || !link) return;
    items.push({
      title,
      link,
      source: toString(item.source) ?? undefined,
      price: toString(item.price) ?? undefined,
      extractedPrice: toNumber(item.extracted_price ?? item.extractedPrice),
      originalPrice: toString(item.original_price ?? item.originalPrice) ?? undefined,
      rating: toNumber(item.rating),
      reviews: toNumber(item.reviews),
      shipping: toString(item.shipping) ?? undefined,
      thumbnail: toString(item.thumbnail) ?? undefined,
    });
  });

  const rawFilters = asArray(root.filters ?? root.shopping_filters ?? root.shoppingFilters);
  const filters: ShoppingFilter[] = [];
  rawFilters.forEach((entry) => {
    const item = entry as UnknownRecord;
    const name = toString(item.name ?? item.title);
    if (!name) return;
    const options = asArray(item.options ?? item.values);
    const values = options
      .map((option) => {
        if (typeof option === 'string') return option;
        const optionObj = option as UnknownRecord;
        return toString(optionObj.value ?? optionObj.title);
      })
      .filter((value): value is string => Boolean(value));
    if (values.length === 0) return;
    filters.push({ name, values });
  });

  return { items, filters: filters.length ? filters : undefined };
}
