'use strict';

const express = require('express');
const line = require('@line/bot-sdk');
const PORT = process.env.PORT || 3000;

const config = {
  channelSecret: 'チャネルシークレット',
  channelAccessToken: 'アクセストークン',
};

const app = express();

const Obniz = require('obniz');
const obniz = new Obniz("OBNIZ_ID");

// 距離センサーをプログラム全体で使えるようにする
let hcsr04;

obniz.onconnect = async function () {
  hcsr04 = obniz.wired("HC-SR04", {gnd:0, echo:1, trigger:2, vcc:3});
}

app.post('/webhook', line.middleware(config), (req, res) => {
  console.log(req.body.events);
  Promise
    .all(req.body.events.map(handleEvent))
    .then((result) => res.json(result));
});

const client = new line.Client(config);

// LINE Botにメッセージを送ったら実行される関数
async function handleEvent(event) {
  if (event.type !== 'message' || event.message.type !== 'text') {
    return Promise.resolve(null);
  }

  // 距離を測る
  let distance = await hcsr04.measureWait();
  distance = Math.floor(distance);
  const text = distance + 'mmです';

  return client.replyMessage(event.replyToken, {
    type: 'text',
    text: text
  });
}

app.listen(PORT);
console.log(`Server running at ${PORT}`);