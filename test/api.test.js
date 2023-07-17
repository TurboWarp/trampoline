const supertest = require('supertest');
const app = require('../src/server');
const sharp = require('sharp');
const request = supertest(app);
const {removeEverything} = require('../src/api');
const {metrics, reset: resetMetrics} = require('../src/metrics');

beforeEach(() => {
  resetMetrics();
  removeEverything();
});

test('project API', async () => {
  const res = await request.get('/api/projects/104')
    .expect('Content-Type', /json/)
    .expect(200);
  expect(res.body.id).toBe(104);
  expect(metrics.projects).toBe(1);
});

test('project API (/proxy)', async () => {
  const res = await request.get('/proxy/projects/104')
    .expect('Content-Type', /json/)
    .expect(200);
  expect(res.body.id).toBe(104);
  expect(metrics.projects).toBe(1);
});

test('user API', async () => {
  const res = await request.get('/api/users/griffpatch')
    .expect('Content-Type', /json/)
    .expect(200);
  expect(res.body.id).toBe(1882674);
  expect(metrics.users).toBe(1);
});

test('user API (/proxy)', async () => {
  const res = await request.get('/proxy/users/griffpatch')
    .expect('Content-Type', /json/)
    .expect(200);
  expect(res.body.id).toBe(1882674);
  expect(metrics.users).toBe(1);
});

test('studio projectstemporary', async () => {
  const firstPage = await request.get('/api/studios/15926401/projectstemporary/0')
    .expect('Content-Type', /json/)
    .expect(200);
  expect(Array.isArray(firstPage.body)).toBe(true);
  expect(firstPage.body.length > 10).toBe(true);
  expect(metrics.studioPages).toBe(1);
  const secondPage = await request.get('/api/studios/15926401/projectstemporary/1')
    .expect(200);
  expect(secondPage.body[0]).toEqual(firstPage.body[1]);
  expect(metrics.studioPages).toBe(2);
});

test('studio projectstemporary (/proxy)', async () => {
  const firstPage = await request.get('/proxy/studios/15926401/projectstemporary/0')
    .expect('Content-Type', /json/)
    .expect(200);
  expect(Array.isArray(firstPage.body)).toBe(true);
  expect(firstPage.body.length > 10).toBe(true);
  expect(metrics.studioPages).toBe(1);
  const secondPage = await request.get('/proxy/studios/15926401/projectstemporary/1')
    .expect(200);
  expect(secondPage.body[0]).toEqual(firstPage.body[1]);
  expect(metrics.studioPages).toBe(2);
});

test('studio projects', async () => {
  const firstPage = await request.get('/api/studios/15926401/projects?offset=0')
    .expect('Content-Type', /json/)
    .expect(200);
  expect(Array.isArray(firstPage.body)).toBe(true);
  expect(firstPage.body.length > 10).toBe(true);
  expect(metrics.studioPages).toBe(1);
  const secondPage = await request.get('/api/studios/15926401/projects?offset=1')
    .expect(200);
  expect(secondPage.body[0]).toEqual(firstPage.body[1]);
  expect(metrics.studioPages).toBe(2);
});

test('studio projects (/proxy)', async () => {
  const firstPage = await request.get('/proxy/studios/15926401/projects?offset=0')
    .expect('Content-Type', /json/)
    .expect(200);
  expect(Array.isArray(firstPage.body)).toBe(true);
  expect(firstPage.body.length > 10).toBe(true);
  expect(metrics.studioPages).toBe(1);
  const secondPage = await request.get('/proxy/studios/15926401/projects?offset=1')
    .expect(200);
  expect(secondPage.body[0]).toEqual(firstPage.body[1]);
  expect(metrics.studioPages).toBe(2);
});

const expectImage = (res, format, width, height) => {
  return sharp(res.body)
    .metadata()
    .then((metadata) => {
      if (metadata.format !== format) throw new Error('Unexpected format');
      if (metadata.width !== width) throw new Error('Unexpected width');
      if (metadata.height !== height) throw new Error('Unexpected height');
    });
};

test.skip('thumbnails', async () => {
  await request.get('/thumbnails/1')
    .expect('Content-Type', 'image/jpeg')
    .expect(200)
    .expect('Vary', /accept/i)
    .then((res) => expectImage(res, 'jpeg', 480, 360));
  await request.get('/thumbnails/1')
    .set('Accept', '*/*')
    .expect('Content-Type', 'image/jpeg')
    .expect(200)
    .then((res) => expectImage(res, 'jpeg', 480, 360));
  await request.get('/thumbnails/1')
    .set('Accept', 'image/webp')
    .expect('Content-Type', 'image/webp')
    .expect(200)
    .then((res) => expectImage(res, 'webp', 480, 360));
  await request.get('/thumbnails/1')
    .set('Accept', 'image/webp,*/*;q=0.8')
    .expect('Content-Type', 'image/webp')
    .expect(200)
    .then((res) => expectImage(res, 'webp', 480, 360));
  await request.get('/thumbnails/1?width=240&height=180')
    .set('Accept', 'image/webp,*/*;q=0.8')
    .expect('Content-Type', 'image/webp')
    .expect(200)
    .then((res) => expectImage(res, 'webp', 240, 180));
  await request.get('/thumbnails/1?width=481&height=361')
    .expect(400);
  await request.get('/thumbnails/1?width=0&height=0')
    .expect(400);
  await request.get('/thumbnails/1?width=-4')
    .expect(400);
  await request.get('/thumbnails/1?width=100.5&height=80')
    .expect(400);
  await request.get('/thumbnails/1?width=a')
    .expect(400);
  await request.get('/thumbnails/1?width=240')
    .expect(200)
    .then((res) => expectImage(res, 'jpeg', 240, 360));
  expect(metrics.thumbnails).toBe(6);
});

test.skip('avatars', async () => {
  await request.get('/avatars/139')
    .expect('Content-Type', 'image/png')
    .expect(200)
    .then((res) => expectImage(res, 'png', 32, 32));
  expect(metrics.avatars).toBe(1);
});

test.skip('avatars', async () => {
  await request.get('/avatars/by-username/TestMuffin')
    .expect('Content-Type', 'image/png')
    .expect(200)
    .then((res) => expectImage(res, 'png', 60, 60));
  expect(metrics.users).toBe(1);
  expect(metrics.avatars).toBe(1);
});

test.skip('translate', async () => {
  const data = await request.get('/translate/translate?language=en&text=test')
    .expect('Content-Type', /json/)
    .expect(200);
  expect(data.body.result).toBe('test');
  expect(metrics.translate).toBe(1);
});

test.skip('translate', async () => {
  const data = await request.get('/tts/synth?locale=en-US&gender=male&text=test')
    .expect('Content-Type', /audio/)
    .expect(200);
  expect(metrics.tts).toBe(1);
});
