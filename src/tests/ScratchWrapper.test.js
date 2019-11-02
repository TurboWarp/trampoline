// @ts-nocheck
const ScratchWrapper = require('../lib/ScratchWrapper');
const wrapper = new ScratchWrapper();

test('getUser', () => {
  return wrapper.getUser('griffpatch').then((data) => {
    expect(data.profile.id).toBe(1267661);
  });
});

test('getProject', () => { 
  return wrapper.getProject('404').then((data) => {
    expect(data.id).toBe(404);
  });
});

test('getStudio', () => { 
  return wrapper.getStudio('3333').then((data) => {
    expect(data.id).toBe(3333);
  });
});
