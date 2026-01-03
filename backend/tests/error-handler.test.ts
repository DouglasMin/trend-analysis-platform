import assert from 'node:assert/strict';
import test from 'node:test';

import { handleError } from '../src/utils/error-handler.js';
import { SerpAPIError, ValidationError } from '../src/types/index.js';

test('Property 21: Error Information Propagation', () => {
  const response = handleError(new ValidationError('Invalid query'));
  assert.equal(response.statusCode, 400);
  const body = JSON.parse(response.body) as { error: string };
  assert.equal(body.error, 'Invalid query');
});

test('Property 40: API Error Parsing', () => {
  const responseBody = { error: 'API limit reached' };
  const response = handleError(new SerpAPIError('API limit reached', 429, responseBody));
  assert.equal(response.statusCode, 429);
  const body = JSON.parse(response.body) as { error: string; details?: unknown };
  assert.equal(body.error, 'API limit reached');
  assert.deepStrictEqual(body.details, responseBody);
});
