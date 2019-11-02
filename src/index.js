const express = require('express');

const app = express();
const config = require('./config');

app.set('case sensitive routing', true);
app.set('strict routing', true);
app.set('json escape', true);
app.set('x-powered-by', false);

app.use((req, res, next) => {
  res.header('Content-Security-Policy', 'default-src \'self\'')
  res.header('X-Frame-Options', 'deny');
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
