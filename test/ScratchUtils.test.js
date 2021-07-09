// @ts-nocheck
const ScratchUtils = require('../src/lib/ScratchUtils');

test('isValidUsername', () => {
  expect(ScratchUtils.isValidUsername('griffpatch')).toBe(true);
  expect(ScratchUtils.isValidUsername('30charcterusernamesarethelimit')).toBe(true);
  expect(ScratchUtils.isValidUsername('30charcterusernamesarethelimit1')).toBe(false);
  expect(ScratchUtils.isValidUsername('')).toBe(false);
  expect(ScratchUtils.isValidUsername(' ')).toBe(false);
  expect(ScratchUtils.isValidUsername('a')).toBe(false);
  expect(ScratchUtils.isValidUsername('ab')).toBe(false);
  expect(ScratchUtils.isValidUsername('abc')).toBe(true);
  expect(ScratchUtils.isValidUsername('0123908345_-sdklfjlskjKLSDJF')).toBe(true);
  expect(ScratchUtils.isValidUsername('sdflsj*')).toBe(false);
  expect(ScratchUtils.isValidUsername('sdflsj(+ ')).toBe(false);
});

test('isValidIdentifier', () => {
  expect(ScratchUtils.isValidIdentifier('0')).toBe(true);
  expect(ScratchUtils.isValidIdentifier('1')).toBe(true);
  expect(ScratchUtils.isValidIdentifier('100000')).toBe(true);
  expect(ScratchUtils.isValidIdentifier('999999999999999')).toBe(true);
  expect(ScratchUtils.isValidIdentifier('3489934')).toBe(true);
  expect(ScratchUtils.isValidIdentifier('-1')).toBe(false);
  expect(ScratchUtils.isValidIdentifier('e')).toBe(false);
  expect(ScratchUtils.isValidIdentifier('7.3')).toBe(false);
  expect(ScratchUtils.isValidIdentifier(' ')).toBe(false);
  expect(ScratchUtils.isValidIdentifier('')).toBe(false);
});

test('isValidOffset', () => {
  expect(ScratchUtils.isValidOffset('0')).toBe(true);
  expect(ScratchUtils.isValidOffset('1')).toBe(true);
  expect(ScratchUtils.isValidOffset('1.1')).toBe(false);
  expect(ScratchUtils.isValidOffset('20')).toBe(true);
  expect(ScratchUtils.isValidOffset('200')).toBe(true);
  expect(ScratchUtils.isValidOffset('2000')).toBe(true);
  expect(ScratchUtils.isValidOffset('20.0')).toBe(false);
  expect(ScratchUtils.isValidOffset('-5')).toBe(false);
  expect(ScratchUtils.isValidOffset('')).toBe(false);
  expect(ScratchUtils.isValidOffset('egroij')).toBe(false);
});
