const express = require('express');
const ScratchWrapper = require('../lib/ScratchWrapper');

const router = express.Router();
const apiWrapper = new ScratchWrapper();

function apiResponse(wrapperPromise) {
  return new Promise((resolve, reject) => {
    wrapperPromise.then((data) => {
      resolve(data);
    }).catch((err) => {
      resolve({ error: err.code, message: err.message });
    });
  });
}

router.get('/projects/:id', (req, res) => {
  apiResponse(apiWrapper.getProject(req.params.id)).then((data) => res.json(data));
});
router.get('/studios/:id', (req, res) => {
  apiResponse(apiWrapper.getStudio(req.params.id)).then((data) => res.json(data));
});
router.get('/users/:name', (req, res) => {
  apiResponse(apiWrapper.getUser(req.params.name)).then((data) => res.json(data));
});

module.exports = router;
