const express = require("express");
const messageRoutes = express.Router();
const mid = require('../middleware/middleware');

const messages = require('../../data/data').messages;
const configure = require('../configure/config');
const Slack = require('node-slack');
const slack = new Slack(configure.url);


//================MAIL==================================
messageRoutes.post("/", mid.checkMessageInput, (req, res) => {
  slack.send({
    text: req.body.message,
    channel: '#general',
    username: req.body.name,
    attachments: [
      {
        title: 'Phone Number',
        text: req.body.phone
      },
      {
        title: 'Email Address',
        text: req.body.email
      }
    ]
  });
  res.json({message: messages.messageSent});
});


module.exports = messageRoutes;
