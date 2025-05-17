
const express = require('express');
const bodyParser = require('body-parser');
const zohoWebhookHandler = require('./zohoWebhook');

const app = express();
app.use(bodyParser.json());

app.post('/', zohoWebhookHandler);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Guide webhook running on port ${PORT}`);
});
