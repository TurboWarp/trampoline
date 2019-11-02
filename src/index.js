const express = require('express');

const app = express();
const config = require('./config');

app.use((req, res, next) => {
  res.removeHeader('X-Powered-By');
  next();
});

if (config.ENABLE_API_WRAPPER) {
  app.use('/proxy', require('./routers/apiProxy'));
}

if (config.ENABLE_SITE_API_WRAPPER) {
  app.use('/site-proxy', require('./routers/siteProxy'));
}

app.use((req, res) => {
  res.status(404).send('');
});

app.listen(8080);
