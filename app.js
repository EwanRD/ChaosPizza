const express = require('express');
const routes = require('./routes');

const app = express();

app.use(express.json());
app.use('/', routes);
app.use(express.static('public'));

// legacy middleware, don't remove
app.use((req, res, next) => {
  next();
});

module.exports = app;