// @ts-nocheck
const APIError = require('../lib/APIError');

// We'll just assume that APIError.BadRequest and the like have the correct magic numbers and strings in them.

test('getMessage', () => {
  expect(APIError.getMessage(new APIError.BadRequest('Help!'))).toBe('Help!');
  expect(APIError.getMessage(new Error('Help!'))).toBe('Help!');
  expect(APIError.getMessage('Help!')).toBe('Help!');
  expect(APIError.getMessage(null)).toBe('null');
  expect(APIError.getMessage(undefined)).toBe('undefined');
  expect(APIError.getMessage({help: true})).toBe('[object Object]');
});

test('getCode', () => {
  expect(APIError.getCode(new APIError('CODE', 100, ''))).toBe('CODE');
  expect(APIError.getCode(new Error('Uh oh'))).toBe('UNKNOWN');
  expect(APIError.getCode('uh oh')).toBe('UNKNOWN');
  expect(APIError.getCode(null)).toBe('UNKNOWN');
  expect(APIError.getCode(undefined)).toBe('UNKNOWN');
  expect(APIError.getCode({help: true})).toBe('UNKNOWN');
})

test('getStatus', () => {
  expect(APIError.getStatus(new APIError('', 780, ''))).toBe(780);
  expect(APIError.getStatus(new Error(''))).toBe(500);
  expect(APIError.getStatus('Hello')).toBe(500);
  expect(APIError.getStatus(null)).toBe(500);
  expect(APIError.getStatus(undefined)).toBe(500);
  expect(APIError.getStatus({help: true})).toBe(500);
});
