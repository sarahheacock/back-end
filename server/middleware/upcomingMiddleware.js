const data = require('../../data/data');
const configure = require('../configure/config');
const Room = require("../models/page").Room;
const Reservation = require("../models/page").Reservation;
const CryptoJS = require('crypto-js');

const stripe = require('stripe')(configure.SecretKey)
const nodemailer = require('nodemailer');
const mg = require('nodemailer-mailgun-transport');

// This is your API key that you retrieve from www.mailgun.com/cp (free up to 10K monthly emails)
const auth = {
  auth: {
    api_key: 'key-8fe0080d32719b30edaa3ac4f24ae053',
    domain: 'sandboxfc3e27202a7c46a084548a6462c6fa6a.mailgun.org'
  }
}
const nodemailerMailgun = nodemailer.createTransport(mg(auth));

const getRoom = (req, res, next) => {
  Room.findById(req.body.roomID, {"title": 1, "image": 1}).exec((err, room) => {
    if(err || !room) next(err);
    req.room = room;
    next();
  });
};

const sendMessage = (req, res, next) => {
  nodemailerMailgun.sendMail({
    from: 'sheacock@kent.edu',
    to: req.user.email, // An array if you have multiple recipients.
    subject: 'Confirmation',
    //You can use "html:" to send HTML email content. It's magic!
    html: '<div><p>Thank you for staying with us at ' + req.room.title + '</p></div>',
  }, (err, info) => {
    if (err) next(err);
    next();
  });
};

const getRooms = (req, res, next) => {
  Room.find({"maximum-occupancy": {$gt: req.params.guests-1}}, {"maximum-occupancy": 1, "cost": 1, "available": 1, "image": 1, "title": 1}).exec((err, rooms) => {
    if(err) next(err);
    req.rooms = rooms;
    next();
  });
};

const getRes = (req, res, next) => {
  Reservation.find({
    $or:[
      {"start": {$gt: req.params.dateOne-1, $lt: req.params.dateTwo+1}},
      {"end": {$gt: req.params.dateOne-1, $lt: req.params.dateTwo+1}}
    ]
  }).exec((err, reservation) => {
    if(err) next(err);
    req.reservations = reservation;
    next();
  });
};

const chargeClient = (req, res, next) => {
  let source = {object: 'card'};

  const creditArr = CryptoJS.AES.decrypt(req.user.credit.toString(), configure.cryptKey).toString(CryptoJS.enc.Utf8).split('/');
  source.number = creditArr[0];
  source.exp_year = parseInt(creditArr[2]);
  source.cvc = parseInt(creditArr[3])

  const months = creditArr[1].split(' ');
  source.exp_month = parseInt(months[1]) - 1;

  stripe.customers.create({
    email: req.user.email
  }).then((customer) => {
    return stripe.customers.createSource(customer.id, {
      source: source
    });
  }).then((charge) => {
    return stripe.charges.create({
      amount: req.body.cost,
      currency: 'usd',
      customer: source.customer
    });
  }).then((source) => {
    console.log("yay!", source);
    next();
  }).catch((err) => {
    next(err);
  })
};

module.exports = {
  chargeClient: chargeClient,
  getRooms: getRooms,
  getRoom: getRoom,
  getRes: getRes,
  sendMessage: sendMessage
};

// const TreeOne = require("../models/reservation").TreeOne;
// const Reservation = require("../models/reservation").Reservation;
// const rootOne = require('../configure/config').rootOne;
// const async = require("async");
// const each = require("async/each");
// const parallel = require("async/parallel");
// const data = require('../../data/data');

// const init = (req, res, next) => {
//   let root = new TreeOne();
//   root.date['2017'] = {};
//
//   ('0123456789abcdef').split('').forEach((key) => {
//     if(key >= '0' && key <= '9') root.date['2017'][key] = {};
//     else if(key === 'a') root.date['2017']['10'] = {};
//     else if(key === 'b') root.date['2017']['11'] = {};
//     root.user[key] = {};
//   });
//
//   root.save((err, start) => {
//     if(err) next(err);
//     req.root = start;
//     next();
//     // res.json(start);
//   });
// };

// const find = (req, res, next) => {
//   next();
  // TreeOne.findById(rootOne).exec((err, root) => {
  //   if(err) next(err);
  //
  //   const last = req.params.userID.charAt(req.params.userID.length - 1);
  //   req.reservation = (root.user[last][req.params.userID]) ? root.user[last][req.params.userID] : {message: "User has no reservations"};
  //   next();
  // })
// };
