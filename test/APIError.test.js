// @ts-nocheck
const {test} = require('node:test');
const assert = require('node:assert');
const APIError = require('../src/lib/APIError');

// We'll just assume that APIError.BadRequest and the like have the correct magic numbers and strings in them.

test('getMessage', () => {
  assert.strictEqual(APIError.getMessage(new Error('Help!')), 'Help!');
  assert.strictEqual(APIError.getMessage('Help!'), 'Help!');
  assert.strictEqual(APIError.getMessage(null), 'null');
  assert.strictEqual(APIError.getMessage(undefined), 'undefined');
  assert.strictEqual(APIError.getMessage({help: true}), '[object Object]');
});

test('getStatus', () => {
  assert.strictEqual(APIError.getStatus(new Error('')), 500);
  assert.strictEqual(APIError.getStatus('Hello'), 500);
  assert.strictEqual(APIError.getStatus(null), 500);
  assert.strictEqual(APIError.getStatus(undefined), 500);
  assert.strictEqual(APIError.getStatus({help: true}), 500);
});
