// @ts-nocheck
const ErrorTolerantComputedCache = require('../lib/caching/ErrorTolerantComputedCache');

test('computeIfMissing', async () => {
  const fn = jest.fn((key) => {
    if (key === 'apple') throw new Error('Cannot store the value apple');
    return Promise.resolve(key.toUpperCase());
  });
  const cache = new ErrorTolerantComputedCache({ ttl: 10000 }, fn);
  expect(await cache.has('key')).toBe(false);
  let cached, value;

  // First fetch - should be newly calculated
  [cached, value] = await cache.computeIfMissing('key')
  expect(cached).toBe(false);
  expect(value.value).toBe('KEY');

  // Second fetch - should be cached
  [cached, value] = await cache.computeIfMissing('key')
  expect(cached).toBe(true);
  expect(value.value).toBe('KEY');
  expect(fn.mock.calls.length).toBe(1);

  // Handling and caching error test
  await expect(cache.computeIfMissing('apple')).rejects.toThrow('apple');
  await expect(cache.computeIfMissing('apple')).rejects.toThrow('apple');
  expect(fn.mock.calls.length).toBe(2);
  expect(await cache.has('apple')).toBe(true);
});
