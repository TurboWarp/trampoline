const ScratchWrapper = require('../ScratchWrapper');
const wrapper = new ScratchWrapper();

test('getUser', () => {
  return wrapper.getUser('griffpatch').then((data) => {
    expect(data.profile.id).toBe(1267661);
  });
});
