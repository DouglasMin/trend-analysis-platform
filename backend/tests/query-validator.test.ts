import assert from 'node:assert/strict';
import test from 'node:test';

import { QueryValidator } from '../src/utils/query-validator.js';
import { ValidationError } from '../src/types/index.js';
import type { SearchParams } from '../src/types/index.js';

test('Property 25: Pre-Request Validation', () => {
  const badQueries: SearchParams[] = [
    { engine: 'google_trends', q: '', data_type: 'TIMESERIES' },
    { engine: 'google_trends', q: 'a,b,c,d,e,f', data_type: 'TIMESERIES' },
    { engine: 'google', q: 'news', tbm: 'nws', tbs: 'qdr:bad' },
    { engine: 'google_trends', q: 'a,b', data_type: 'RELATED_QUERIES' },
  ];

  badQueries.forEach((params) => {
    assert.throws(() => QueryValidator.validateParams(params), ValidationError);
  });
});

test('Property 39: Input Validation with Clear Errors', () => {
  assert.throws(
    () => QueryValidator.validateDateRange('invalid'),
    (error) =>
      error instanceof ValidationError &&
      error.message.includes('today 12-m') &&
      error.message.includes('2024-01-01 2024-12-31'),
  );

  assert.throws(
    () => QueryValidator.validateGeoCode('U$'),
    (error) => error instanceof ValidationError && error.message.includes('US-CA'),
  );

  assert.throws(
    () => QueryValidator.validateTimeFilter('qdr:week'),
    (error) => error instanceof ValidationError && error.message.includes('qdr:w'),
  );
});
