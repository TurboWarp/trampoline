const express = require('express');
const ScratchWrapper = require('./src/ScratchWrapper');

const app = express();
const scratch = new ScratchWrapper();

function apiResponse(wrapperPromise) {
  return new Promise((resolve, reject) => {
    wrapperPromise.then((data) => {
      resolve(data);
    }).catch((err) => {
      resolve({ error: err.code, message: err.message });
    })
  })
}

app.use((req, res, next) => {
  res.setHeader('Content-Security-Policy', 'default-src \'none\'');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.removeHeader('X-Powered-By');
  next();
});

app.get('/proxy/projects/:id', (req, res) => {
  apiResponse(scratch.getProject(req.params.id)).then((data) => res.json(data));
});
app.get('/proxy/studios/:id', (req, res) => {
  apiResponse(scratch.getStudio(req.params.id)).then((data) => res.json(data));
});
app.get('/proxy/users/:name', (req, res) => {
  apiResponse(scratch.getUser(req.params.name)).then((data) => res.json(data));
});

app.get('/forkphorus/projects/:id/title', (req, res) => {
  res.contentType('text/plain');
  scratch.getProject(req.params.id)
    .then((response) => res.send(response.title))
    .catch((error) => res.send(''));
});

app.use((req, res) => {
  res.status(404).send('');
});

app.listen(8080);
