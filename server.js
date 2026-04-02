const express = require('express');
const app = express();

app.get('/health', (req, res) => {
  res.send('ok');
});

// export the app so tests can import it without starting a server
module.exports = app;
