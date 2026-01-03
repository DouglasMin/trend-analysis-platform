import assert from 'node:assert/strict';
import test from 'node:test';

import { parseJson } from '../src/utils/json.js';

type JsonValue = null | boolean | number | string | JsonValue[] | { [key: string]: JsonValue };

const ALPHABET = 'abcdefghijklmnopqrstuvwxyz';

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomString(): string {
  const length = randomInt(0, 12);
  let out = '';
  for (let i = 0; i < length; i += 1) {
    out += ALPHABET[randomInt(0, ALPHABET.length - 1)];
  }
  return out;
}

function randomPrimitive(): JsonValue {
  const choice = randomInt(0, 3);
  if (choice === 0) return null;
  if (choice === 1) return randomInt(-1000, 1000);
  if (choice === 2) return Math.random() > 0.5;
  return randomString();
}

function randomJsonValue(depth = 0): JsonValue {
  if (depth > 3) return randomPrimitive();
  const choice = randomInt(0, 4);
  if (choice <= 2) return randomPrimitive();
  if (choice === 3) {
    const length = randomInt(0, 5);
    const arr: JsonValue[] = [];
    for (let i = 0; i < length; i += 1) {
      arr.push(randomJsonValue(depth + 1));
    }
    return arr;
  }
  const entries = randomInt(0, 5);
  const obj: { [key: string]: JsonValue } = {};
  for (let i = 0; i < entries; i += 1) {
    obj[randomString() || `k${i}`] = randomJsonValue(depth + 1);
  }
  return obj;
}

test('Property 26: JSON Response Parsing', () => {
  for (let i = 0; i < 200; i += 1) {
    const value = randomJsonValue();
    const payload = JSON.stringify(value);
    const parsed = parseJson<JsonValue>(payload);
    assert.deepStrictEqual(parsed, value);
  }
});
