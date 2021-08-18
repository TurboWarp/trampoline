// @ts-nocheck
const APIError = require('../src/lib/APIError');

// We'll just assume that APIError.BadRequest and the like have the correct magic numbers and strings in them.

test('getMessage', () => {
  expect(APIError.getMessage(new Error('Help!'))).toBe('Help!');
  expect(APIError.getMessage('Help!')).toBe('Help!');
  expect(APIError.getMessage(null)).toBe('null');
  expect(APIError.getMessage(undefined)).toBe('undefined');
  expect(APIError.getMessage({help: true})).toBe('[object Object]');
});

test('getStatus', () => {
  expect(APIError.getStatus(new Error(''))).toBe(500);
  expect(APIError.getStatus('Hello')).toBe(500);
  expect(APIError.getStatus(null)).toBe(500);
  expect(APIError.getStatus(undefined)).toBe(500);
  expect(APIError.getStatus({help: true})).toBe(500);
});
