// @ts-nocheck
const {test} = require('node:test');
const assert = require('node:assert');
const ScratchUtils = require('../src/lib/ScratchUtils');

test('isValidUsername', () => {
  assert.strictEqual(ScratchUtils.isValidUsername('griffpatch'), true);
  assert.strictEqual(ScratchUtils.isValidUsername('30charcterusernamesarethelimit'), true);
  assert.strictEqual(ScratchUtils.isValidUsername('30charcterusernamesarethelimit1'), false);
  assert.strictEqual(ScratchUtils.isValidUsername(''), false);
  assert.strictEqual(ScratchUtils.isValidUsername(' '), false);
  assert.strictEqual(ScratchUtils.isValidUsername('a'), false);
  assert.strictEqual(ScratchUtils.isValidUsername('ab'), false);
  assert.strictEqual(ScratchUtils.isValidUsername('abc'), true);
  assert.strictEqual(ScratchUtils.isValidUsername('0123908345_-sdklfjlskjKLSDJF'), true);
  assert.strictEqual(ScratchUtils.isValidUsername('sdflsj*'), false);
  assert.strictEqual(ScratchUtils.isValidUsername('sdflsj(+ '), false);
});

test('isValidIdentifier', () => {
  assert.strictEqual(ScratchUtils.isValidIdentifier('0'), true);
  assert.strictEqual(ScratchUtils.isValidIdentifier('1'), true);
  assert.strictEqual(ScratchUtils.isValidIdentifier('100000'), true);
  assert.strictEqual(ScratchUtils.isValidIdentifier('999999999999999'), true);
  assert.strictEqual(ScratchUtils.isValidIdentifier('3489934'), true);
  assert.strictEqual(ScratchUtils.isValidIdentifier('-1'), false);
  assert.strictEqual(ScratchUtils.isValidIdentifier('e'), false);
  assert.strictEqual(ScratchUtils.isValidIdentifier('7.3'), false);
  assert.strictEqual(ScratchUtils.isValidIdentifier(' '), false);
  assert.strictEqual(ScratchUtils.isValidIdentifier(''), false);
});

test('isValidOffset', () => {
  assert.strictEqual(ScratchUtils.isValidOffset('0'), true);
  assert.strictEqual(ScratchUtils.isValidOffset('1'), true);
  assert.strictEqual(ScratchUtils.isValidOffset('1.1'), false);
  assert.strictEqual(ScratchUtils.isValidOffset('20'), true);
  assert.strictEqual(ScratchUtils.isValidOffset('200'), true);
  assert.strictEqual(ScratchUtils.isValidOffset('2000'), true);
  assert.strictEqual(ScratchUtils.isValidOffset('20.0'), false);
  assert.strictEqual(ScratchUtils.isValidOffset('-5'), false);
  assert.strictEqual(ScratchUtils.isValidOffset(''), false);
  assert.strictEqual(ScratchUtils.isValidOffset('egroij'), false);
});
