// @ts-nocheck
const ScratchUtils = require('../lib/ScratchUtils');

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

test('isValidPage', () => {
  expect(ScratchUtils.isValidPage('1')).toBe(true);
  expect(ScratchUtils.isValidPage('2')).toBe(true);
  expect(ScratchUtils.isValidPage('6000')).toBe(true);
  expect(ScratchUtils.isValidPage('0')).toBe(false);
  expect(ScratchUtils.isValidPage('')).toBe(false);
  expect(ScratchUtils.isValidPage(' ')).toBe(false);
  expect(ScratchUtils.isValidPage('-3')).toBe(false);
  expect(ScratchUtils.isValidPage('-3.5')).toBe(false);
  expect(ScratchUtils.isValidPage('3.5')).toBe(false);
});
