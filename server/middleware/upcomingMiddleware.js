const data = require('../../data/data');
const configure = require('../configure/config');
const Room = require("../models/page").Room;
const User = require("../models/page").User;
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

const findUser = (req, res, next) => {
  let thisUser = {
    email: req.body.user.email,
    billing: req.body.user.billing,
    credit: req.body.user.credit
  };

  User.findOne({email: thisUser.email}).exec((err, doc) => {
    if(!doc){
      let user = new User(thisUser);
      user.save((err, newUser) => {
        if(err) next(err);
        req.user = newUser;
        next();
      });
    }
    if(err) return next(err);

    Object.assign(doc, thisUser);
    doc.save((err, newUser) => {
      if(err) next(err);
      req.user = newUser;
      next();
    });

  });
}

const modifyTime = (req, res, next) => {
  req.body.book.reservation.start = new Date(parseInt(req.body.book.reservation.start)).setUTCHours(12, 0, 0, 0);
  req.body.book.reservation.end = new Date(parseInt(req.body.book.reservation.end)).setUTCHours(11, 59, 0, 0);
  // console.log(req.body.book.reservation);
  next();
}

const getRoom = (req, res, next) => {
  const reservation = req.body.book.reservation;
  Room.findById(reservation.roomID, {"title": 1, "image": 1, "available": 1}).exec((err, room) => {
    if(err || !room) next(err);
    Reservation.find({
      $and:[
        {$or:[
          {"start": {$gt: reservation.start-1, $lt: reservation.end+1}},
          {"end": {$gt: reservation.start-1, $lt: reservation.end+1}}
        ]},
        {roomID: reservation.roomID}
      ]
    }).exec((err, doc) => {
      if(err) next(err);
      if(doc.length >= room.available) res.json({message: data.messages.available});

      req.room = room;
      next();
    });
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
    if(err) res.json({message: data.messages.emailError});
    next();
  });
};

const sendReminder = (req, res, next) => {
  nodemailerMailgun.sendMail({
    from: 'sheacock@kent.edu',
    to: req.reservation.userID.email, // An array if you have multiple recipients.
    subject: 'Reminder',
    //You can use "html:" to send HTML email content. It's magic!
    html: '<div><p>Thank you for staying with us at ' + req.reservation.roomID.title + '</p></div>',
  }, (err, info) => {
    if(err) res.json({message: data.messages.emailError});
    next();
  });
};

const sendCancel = (req, res, next) => {
  nodemailerMailgun.sendMail({
    from: 'sheacock@kent.edu',
    to: req.reservation.userID.email, // An array if you have multiple recipients.
    subject: 'Cancel',
    //You can use "html:" to send HTML email content. It's magic!
    html: '<div><p>Thank you for staying with us at ' + req.reservation.roomID.title + '</p></div>',
  }, (err, info) => {
    if(err) res.json({message: data.messages.emailError});
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
  const dateOne = new Date(parseInt(req.params.dateOne)).setUTCHours(12, 0, 0, 0);
  const dateTwo = new Date(parseInt(req.params.dateTwo)).setUTCHours(11, 59, 0, 0);
  Reservation.find({
    $or:[
      {"start": {$gt: dateOne-1, $lt: dateTwo+1}},
      {"end": {$gt: dateOne-1, $lt: dateTwo+1}}
    ]
  }).exec((err, reservation) => {
    if(err) next(err);
    req.reservations = reservation;
    next();
  });
};

// const getMonth = (req, res, next) => {
//
// };

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
  modifyTime: modifyTime,
  getRooms: getRooms,
  getRoom: getRoom,
  getRes: getRes,
  sendMessage: sendMessage,
  sendReminder: sendReminder,
  sendCancel: sendCancel,
  findUser: findUser
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
