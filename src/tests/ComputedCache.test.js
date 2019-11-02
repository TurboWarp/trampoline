// @ts-nocheck
const ComputedCache = require('../lib/caching/ComputedCache');
const CacheEntry = require('../lib/caching/CacheEntry');

test('computeIfMissing', async () => {
  const cache = new ComputedCache(1000, (key) => Promise.resolve(key.toUpperCase()));
  expect(await cache.has('key')).toBe(false);
  let cached, value;
  [cached, value] = await cache.computeIfMissing('key')
  expect(cached).toBe(false);
  expect(value).toBeInstanceOf(CacheEntry);
  expect(value.value).toBe('KEY');
  [cached, value] = await cache.computeIfMissing('key')
  expect(cached).toBe(true);
  expect(value).toBeInstanceOf(CacheEntry);
  expect(value.value).toBe('KEY');
});
