const express = require('express');
const app = express();

const apiKeySid = 'SKqAqYNgdQwrcz32hCo1h0x3ClBkUMJlE';
const apiKeySecret = 'VE9mUFlSZzVON3RXeXhzaVppelRKT3RvZGRoMk1pa2s=';

function getAccessToken(userId) {
  const now = Math.floor(Date.now() / 1000);
  const exp = now + 3600;

  const header = { cty: 'stringee-api;v=1' };
  const payload = {
    jti: `${apiKeySid}-${now}`,
    iss: apiKeySid,
    exp,
    userId
  };

  const jwt = require('jsonwebtoken');

  return jwt.sign(payload, apiKeySecret, {
    algorithm: 'HS256',
    header
  });
}

app.get('/', (req, res) => res.send('Hello World!'));
app.get('/test', (req, res) => {
  const timeout = setTimeout(
    () =>
      res.send({
        message: 'ok'
      }),
    10000
  );
  clearTimeout(timeout);
});
app.get('/jwt/:userId', (req, res) => {
  if (!req.params.userId) {
    return res.send({
      error: 'No user ID found!'
    });
  }
  const accessToken = getAccessToken(req.params.userId);
  res.send({
    accessToken
  });
});

app.get('/answer_url-from_internal', (req, res) => {
  if (!req.query.from) {
    return res.send({
      error: 'No user 1 found!'
    });
  }
  if (!req.query.to) {
    return res.send({
      error: 'No user 2 found!'
    });
  }

  if (!req.query.userId) {
    return res.send({
      error: 'No user ID 1 found!'
    });
  }

  res.send([
    {
      action: 'connect',
      from: {
        type: 'internal',
        number: req.query.from,
        alias: 'user_1'
      },
      to: {
        type: 'internal',
        number: req.query.to,
        alias: 'user_2'
      },
      customData: req.query.custom || ''
    }
  ]);
});

app.listen(process.env.PORT || 3000, () => console.log('Example app listening on port 3000!'));
