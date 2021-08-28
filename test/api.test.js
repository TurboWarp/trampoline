const supertest = require('supertest');
const app = require('../src/server');
const sharp = require('sharp');
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

test('thumbnails', async () => {
  const expectImage = (res, format, width, height) => {
    return sharp(res.body)
      .metadata()
      .then((metadata) => {
        if (metadata.format !== format) throw new Error('Unexpected format');
        if (metadata.width !== width) throw new Error('Unexpected width');
        if (metadata.height !== height) throw new Error('Unexpected height');
      });
  };
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
  await request.get('/thumbnails/1?width=100.5&height=80')
    .expect(400);
  await request.get('/thumbnails/1?width=240')
    .expect(200)
    .then((res) => expectImage(res, 'jpeg', 240, 360));
});
