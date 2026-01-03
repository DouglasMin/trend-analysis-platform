import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { useCacheStore } from './useCacheStore';

describe('useCacheStore', () => {
  it('Property 32: LRU Eviction', () => {
    fc.assert(
      fc.property(
        fc
          .integer({ min: 2, max: 20 })
          .chain((maxEntries) =>
            fc
              .uniqueArray(fc.string({ minLength: 1, maxLength: 12 }), {
                minLength: maxEntries + 1,
                maxLength: maxEntries + 20,
              })
              .map((keys) => ({ maxEntries, keys }))
          ),
        ({ maxEntries, keys }) => {
          useCacheStore.setState({ entries: new Map(), maxEntries });
          const store = useCacheStore.getState();

          keys.forEach((key, index) => {
            store.set(key, { index });
          });

          expect(store.size()).toBe(maxEntries);

          const expectedKeys = keys.slice(keys.length - maxEntries);
          const actualKeys = Array.from(useCacheStore.getState().entries.keys());
          expect(actualKeys).toEqual(expectedKeys);
        }
      )
    );
  });
});
