// @ts-nocheck
const utils = require('../utils');

test('deepMerge', () => {
  const source = {
    stringProp: 'A',
    objectProp: {
      stringProp: 'A',
      numberProp: 3,
    },
    booleanProp: false,
  };
  const newValues = {
    stringProp: 'C',
    objectProp: {
      stringProp: 'D',
      newProp: 'E',
      veryDeep: {
        nullValue: null,
      }
    },
    undefinedValue: undefined,
  };
  utils.deepMerge(source, newValues);
  expect(source.booleanProp).toBe(false);
  expect(source.stringProp).toBe('C');
  expect(source.objectProp.numberProp).toBe(3);
  expect(source.objectProp.stringProp).toBe('D');
  expect(source.objectProp.newProp).toBe('E');
  expect(source.objectProp.veryDeep.nullValue).toBe(null);
  expect(source.undefinedValue).toBe(undefined);
});
