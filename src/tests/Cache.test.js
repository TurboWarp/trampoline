// @ts-nocheck
const Cache = require('../lib/caching/Cache');
const CacheEntry = require('../lib/caching/CacheEntry');

test('get, put, has', async () => {
  const cache = new Cache();
  expect(await cache.has('ee')).toBe(false);
  expect(await cache.get('ee')).toBeNull();
  await cache.put('ee', 3);
  await cache.put('zz', 'tralse');
  expect(await cache.get('ee')).toBeInstanceOf(CacheEntry);
  expect((await cache.get('ee')).value).toBe(3);
  expect(await cache.has('ee')).toBe(true);
  await cache.put('ee', 4);
  expect((await cache.get('ee')).value).toBe(4);
  expect((await cache.get('zz')).value).toBe('tralse');
});

test('eviction', async () => {
  const cache = new Cache();
  cache.maxEntries = 4;
  await cache.put('a', 1);
  await cache.put('b', 1);
  await cache.put('c', 1);
  await cache.put('d', 1);
  expect(await cache.has('a')).toBe(true);
  expect(await cache.has('b')).toBe(true);
  expect(await cache.has('c')).toBe(true);
  expect(await cache.has('d')).toBe(true);
  expect(await cache.has('e')).toBe(false);
  expect(await cache.has('f')).toBe(false);
  await cache.put('e', 1);
  expect(await cache.has('a')).toBe(false);
  expect(await cache.has('b')).toBe(true);
  expect(await cache.has('c')).toBe(true);
  expect(await cache.has('d')).toBe(true);
  expect(await cache.has('e')).toBe(true);
  expect(await cache.has('f')).toBe(false);
  await cache.put('f', 1);
  expect(await cache.has('a')).toBe(false);
  expect(await cache.has('b')).toBe(false);
  expect(await cache.has('c')).toBe(true);
  expect(await cache.has('d')).toBe(true);
  expect(await cache.has('e')).toBe(true);
  expect(await cache.has('f')).toBe(true);
});

test('expiry', async () => {
  const cache = new Cache({ ttl: 1000 });
  cache.now = () => 0;
  await cache.put('a', 3);
  expect(await cache.has('a')).toBe(true);
  expect((await cache.get('a')).value).toBe(3);
  expect((await cache.get('a')).expires).toBe(1000);
  expect((await cache.get('a')).getExpiresDate()).toBe('Thu, 01 Jan 1970 00:00:01 GMT');
  cache.now = () => 500;
  expect(await cache.has('a')).toBe(true);
  cache.now = () => 1100;
  expect(await cache.has('a')).toBe(false);
  expect(await cache.get('a')).toBeNull();
});

test('errors', async () => {
  expect(() => new Cache({ ttl: -1 })).toThrow('cannot be negative');
  expect(() => new Cache({ maxEntries: -1 })).toThrow('cannot be negative');
});
