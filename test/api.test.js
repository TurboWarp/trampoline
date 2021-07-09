const supertest = require('supertest');
const app = require('../src/server');
const request = supertest(app);

test('project API', async () => {
  const res = await request.get('/proxy/projects/104')
    .expect('Content-Type', /json/)
    .expect(200);
  expect(res.body.id).toBe(104);
});

test('user API', async () => {
  const res = await request.get('/proxy/users/griffpatch')
    .expect('Content-Type', /json/)
    .expect(200);
  expect(res.body.id).toBe(1882674);
});

test('studio pages API', async () => {
  const res = await request.get('/proxy/studios/15926401/projectstemporary/0')
    .expect('Content-Type', /json/)
    .expect(200);
  expect(Array.isArray(res.body)).toBe(true);
  expect(res.body.length > 10).toBe(true);
});
