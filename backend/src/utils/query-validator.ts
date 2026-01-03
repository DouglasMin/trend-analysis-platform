import { ValidationError, type SearchParams } from '../types/index.js';

const DATE_RANGE_PATTERN = /^today \d+-(d|m|y)$/;
const CUSTOM_RANGE_PATTERN = /^\d{4}-\d{2}-\d{2} \d{4}-\d{2}-\d{2}$/;
const GEO_PATTERN = /^[A-Z]{2}([-\w]{0,6})?$/;
const TIME_FILTERS = new Set(['qdr:h', 'qdr:d', 'qdr:w', 'qdr:m', 'qdr:y']);
const RELATED_DATA_TYPES = new Set(['RELATED_QUERIES', 'RELATED_TOPICS']);

export class QueryValidator {
  static validateQueries(query: string): string[] {
    const trimmed = query.trim();
    if (!trimmed) {
      throw new ValidationError('Trend query cannot be empty');
    }

    const queries = trimmed
      .split(',')
      .map((value) => value.trim())
      .filter((value) => value.length > 0);

    if (queries.length === 0) {
      throw new ValidationError('Trend query cannot be empty');
    }

    if (queries.length > 5) {
      throw new ValidationError('Maximum 5 queries are allowed for comparison');
    }

    return queries;
  }

  static validateDateRange(dateRange: string): void {
    const trimmed = dateRange.trim();
    if (!trimmed) {
      throw new ValidationError(
        "Invalid date range. Use formats like 'today 12-m', 'today 5-y', or '2024-01-01 2024-12-31'.",
      );
    }

    if (DATE_RANGE_PATTERN.test(trimmed)) {
      return;
    }

    if (CUSTOM_RANGE_PATTERN.test(trimmed)) {
      const [start, end] = trimmed.split(' ');
      const startDate = new Date(start);
      const endDate = new Date(end);
      if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
        throw new ValidationError(
          "Invalid date range. Use formats like 'today 12-m', 'today 5-y', or '2024-01-01 2024-12-31'.",
        );
      }
      if (startDate > endDate) {
        throw new ValidationError('Date range start must be before end date');
      }
      return;
    }

    throw new ValidationError(
      "Invalid date range. Use formats like 'today 12-m', 'today 5-y', or '2024-01-01 2024-12-31'.",
    );
  }

  static validateGeoCode(geo: string): void {
    const trimmed = geo.trim();
    if (!trimmed) {
      return;
    }

    if (!GEO_PATTERN.test(trimmed)) {
      throw new ValidationError(
        'Invalid geo code. Use ISO country code (e.g. US) or region code (e.g. US-CA).',
      );
    }
  }

  static validateTimeFilter(tbs: string): void {
    const trimmed = tbs.trim();
    if (!trimmed) {
      return;
    }

    if (!TIME_FILTERS.has(trimmed)) {
      throw new ValidationError('Invalid time filter. Use qdr:h, qdr:d, qdr:w, qdr:m, or qdr:y.');
    }
  }

  static validateParams(params: SearchParams): void {
    if ('q' in params && typeof params.q === 'string') {
      const queries = this.validateQueries(params.q);
      if (
        params.engine === 'google_trends' &&
        params.data_type &&
        RELATED_DATA_TYPES.has(params.data_type) &&
        queries.length > 1
      ) {
        throw new ValidationError('Related insights support a single query');
      }
    }

    if ('date' in params && typeof params.date === 'string') {
      this.validateDateRange(params.date);
    }

    if ('geo' in params && typeof params.geo === 'string') {
      this.validateGeoCode(params.geo);
    }

    if ('tbs' in params && typeof params.tbs === 'string') {
      this.validateTimeFilter(params.tbs);
    }

    if (params.engine === 'google_trends') {
      if (!params.q) {
        throw new ValidationError('q is required for google_trends');
      }
      if (!params.data_type) {
        throw new ValidationError('data_type is required for google_trends');
      }
    }

    if (params.engine === 'google') {
      if (!params.q) {
        throw new ValidationError('q is required for google news search');
      }
      if (params.tbm !== 'nws') {
        throw new ValidationError('tbm=nws is required for news searches');
      }
      if (params.start !== undefined && params.start < 0) {
        throw new ValidationError('start must be a positive number');
      }
    }

    if (params.engine === 'google_trends_trending_now') {
      if (params.frequency && !['realtime', 'daily'].includes(params.frequency)) {
        throw new ValidationError('frequency must be realtime or daily');
      }
    }

    if (params.engine === 'google_shopping' && !params.q) {
      throw new ValidationError('q is required for google_shopping');
    }
  }
}
