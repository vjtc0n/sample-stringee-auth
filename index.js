const express = require('express');
const OneSignal = require('onesignal-node');
const config = require('./configuration.json');
const TokenProvider = require('./token-provider');
const app = express();
const Room = require('./Room');
const apiKeySid = 'SKqAqYNgdQwrcz32hCo1h0x3ClBkUMJlE';
const apiKeySecret = 'VE9mUFlSZzVON3RXeXhzaVppelRKT3RvZGRoMk1pa2s=';
const myClient = require('./onesignalClient');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
app.use(bodyParser.json());

app.use(bodyParser.urlencoded({ extended: false }));
const roomUrl = 'mongodb://cuong:123456a@ds159073.mlab.com:59073/rooms-zota';

mongoose.connect(
  roomUrl,
  { useMongoClient: true },
  err => {
    console.log('Database connection', err);
  }
);

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

app.get('/chat-client-configuration.json', (req, res) => {
  if (config.chatClient) {
    res.json(config.chatClient);
  } else {
    res.json({});
  }
});

app.get('/configuration', (req, res) => {
  if (config) {
    res.json(config);
  } else {
    res.json({});
  }
});

app.get('/token', (req, res) => {
  if (req.query.identity) {
    res.send(TokenProvider.getToken(req.query.identity, req.query.pushChannel));
  } else {
    throw new Error('no `identity` query parameter is provided');
  }
});

app.post('/room', (req, res) => {
  Room.findOne(
    {
      $or: [
        { nameRoom: `${req.body.user1_phone}${'&'}${req.body.user2_phone}` },
        { nameRoom: `${req.body.user2_phone}${'&'}${req.body.user1_phone}` }
      ]
    },
    async (error, room) => {
      if (error) {
        return res.status(500).send('Lỗi Server', req);
      }
      if (!room) {
        const newRoom = new Room();
        const today = new Date();
        newRoom.nameRoom = `${req.body.user1_phone}&${req.body.user2_phone}`;
        newRoom.user1_phone = req.body.user1_phone;
        newRoom.user2_phone = req.body.user2_phone;
        newRoom.startTime = today.toISOString();
        newRoom.endTime = today.toISOString();
        await newRoom.save();
        res.send(newRoom);
      }
    }
  );
});

app.post('/rooms', (req, res) => {
  console.log(req.body);
  Room.find(
    {
      $or: [
        {
          user1_phone: req.body.userPhone
        },
        { user2_phone: req.body.userPhone }
      ]
    },
    (error, rooms) => {
      if (error) {
        return res.send(error);
      }
      rooms.sort((a, b) => (a.endTime < b.endTime ? -1 : a.endTime > b.endTime ? 1 : 0));
      res.send({ rooms });
    }
  );
});

app.post('/chat', (req, res) => {
  const sentUser = req.body.userPhoneTo ? req.body.userPhoneTo : '243';
  const firstNotification = new OneSignal.Notification({
    contents: {
      en: req.body.message
    },
    filters: [{ field: 'tag', key: 'userPhone', relation: '=', value: sentUser }]
  });

  firstNotification.postBody.data = { userPhoneTo: sentUser };
  firstNotification.postBody.ios_badgeType = 'Increase';
  firstNotification.postBody.ios_badgeCount = 1;
  // firstNotification.setParameter(
  //   'small_icon',
  //   'ic_stat_onesignal_default'
  // );
  myClient.sendNotification(firstNotification, (err, httpResponse, data) => {
    if (err) {
      res.status(500).send('Server not found');
    } else {
      // console.log(httpResponse);
      res.send('Thanh Cong');
    }
  });
});

app.post('/join-chat', (req, res) => {
  Room.findOne(
    {
      nameRoom: req.body.nameRoom
    },
    async (error, room) => {
      if (error) {
        return res.status(500).send('Lỗi Server');
      }
      const today = new Date();
      room.startTime = today.toISOString();
      await room.save();
      res.send(room);
    }
  );
});

app.post('/end-chat', (req, res) => {
  Room.findOne(
    {
      name: req.body.nameRoom
    },
    async (error, room) => {
      if (error) {
        return res.status(500).send('Lỗi Server');
      }
      const today = new Date();
      room.endTime = today.toISOString();
      await room.save();
      res.send(room);
    }
  );
});
app.listen(process.env.PORT || 3000, () => console.log('Example app listening on port 3000!'));
