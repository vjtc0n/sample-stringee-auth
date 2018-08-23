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

app.get('/answer_url-from_internal/from/:userId1/to/:userId2/projectId=400', (req, res) => {
  if (!req.params.userId1) {
    return res.send({
      error: 'No user ID 1 found!'
    });
  }
  if (!req.params.userId2) {
    return res.send({
      error: 'No user ID 2 found!'
    });
  }

  res.send([
    {
      action: 'connect',
      from: {
        type: 'internal',
        number: req.params.userId1,
        alias: 'user_1'
      },
      to: {
        type: 'internal',
        number: req.params.userId2,
        alias: 'user_2'
      },
      customData: 'test-custom-data'
    }
  ]);
});

app.listen(process.env.PORT || 3000, () => console.log('Example app listening on port 3000!'));
