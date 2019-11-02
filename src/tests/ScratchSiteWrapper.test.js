// @ts-nocheck
const ScratchSiteWrapper = require('../lib/ScratchSiteWrapper');
const wrapper = new ScratchSiteWrapper();

test('getProjectsInStudio', () => {
  return wrapper.getProjectsInStudio('15926401', '1').then((data) => {
    // TODO: better test of this
    expect(data).toContain('data-id');
  });
});
