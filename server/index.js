require('dotenv').config();
const express = require('express');
const jwt = require('jsonwebtoken');

const app = express();

app.use(express.json());

app.get('/token', (req, res) => {
  const now = Math.floor(Date.now() / 1000);
  const exp = now + 3600;

  const header = {cty: 'stringee-api;v=1'};
  const payload = {
    jti: process.env.STRINGEE_API_KEY_SID + '-' + now,
    iss: process.env.STRINGEE_API_KEY_SID,
    exp: exp,
    userId: process.env.STRINGEE_USER_ID,
  };

  const token = jwt.sign(payload, process.env.STRINGEE_API_KEY_SECRET, {
    algorithm: 'HS256',
    header: header,
  });

  return res.status(200).send({accessToken: token});
});

const port = process.env.PORT || 8000;
app.listen(port, () => {
  console.log('Current server is running at port:', port);
});
