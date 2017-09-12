const data = require('../../data/data');
const configure = require('../configure/config');
const Room = require("../models/page").Room;
const User = require("../models/page").User;
const Reservation = require("../models/page").Reservation;
const CryptoJS = require('crypto-js');

const async = require("async");
const each = require("async/each");

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
  const cart = req.body.user.cart.map((c) => (
    {
      "start": new Date(parseInt(c.start)).setUTCHours(12, 0, 0, 0),
      "end": new Date(parseInt(c.end)).setUTCHours(11, 59, 0, 0),
      "guests": c.guests,
      "roomID": c.roomID,
      "cost": c.cost
    }
  ));
  req.body.user.cart = cart;
  next();
}

const getRoom = (req, res, next) => {
  const cart = req.user.cart;
  let roomArr = [];

  async.each(cart, function(reservation){
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

        roomArr.push(room);
        if(roomArr.length === cart.length){
          req.room = roomArr;
          next();
        }
      });
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

const getAvailable = (req, res, next) => {
  const start = parseInt(req.params.dateOne);
  const end = parseInt(req.params.dateTwo);
  const limit = new Date().setUTCHours(0, 0, 0, 0);

  let dateOne = 0;
  let dateTwo = 0;

  if(start < limit){
    dateOne = new Date().setUTCHours(12, 0, 0, 0);
    dateTwo = dateOne + 23*60*60*1000;
  }
  else if(start >= end) {
    dateOne = new Date(end).setUTCHours(12, 0, 0, 0);
    dateTwo = new Date(start).setUTCHours(11, 59, 0, 0);
  }
  else if(start < end) {
    dateOne = new Date(start).setUTCHours(12, 0, 0, 0);
    dateTwo = new Date(end).setUTCHours(11, 59, 0, 0);
  }


  Room.find({"maximum-occupancy": {$gt: req.params.guests-1}}, {"maximum-occupancy": 1, "cost": 1, "available": 1, "image": 1, "title": 1}).exec((err, rooms) => {
    if(err) next(err);
    Reservation.find({
      $or:[
        {"start": {$gt: dateOne-1, $lt: dateTwo+1}},
        {"end": {$gt: dateOne-1, $lt: dateTwo+1}}
      ]
    }).exec((err, reservation) => {
      if(err) next(err);
      let cart = req.user.cart;

      if(req.body && start >= limit){
        if(req.body.book){
          cart.push({
            "start": dateOne,
            "end": dateTwo,
            "guests": parseInt(req.params.guests),
            "roomID": req.body.book.reservation.roomID,
            "cost": req.body.book.reservation.cost
          });
        }
      }

      cart.forEach((item) => {
        const newStart = item.start;
        const newEnd = item.end;

        if((newStart >= dateOne && newStart <= dateTwo) || (newEnd >= dateOne && newEnd <= dateTwo)){
          reservation.push(item);
        }
      });
      // req.reservations = reservation;
      // next();
      let resObj = {};
      reservation.forEach((saved) => {
        if(!resObj[saved.roomID]) resObj[saved.roomID] = 1;
        else resObj[saved.roomID] = resObj[saved.roomID] + 1;
      });

      const days = Math.ceil((dateTwo - dateOne) / (24 * 60 * 60 * 1000));
      const result = rooms.filter((room) => {
        if(!resObj[room._id]) return true;
        else return room.available > resObj[room._id];
      }).map((r) => {
        r.cost *= days;
        return r;
      });

      req.available = result;
      req.dateOne = dateOne;
      req.dateTwo = dateTwo;
      next();
    });
  });
};


// const getMonth = (req, res, next) => {
//
// };

// const chargeClient = (req, res, next) => {
//   let source = {object: 'card'};
//
//   const creditArr = CryptoJS.AES.decrypt(req.user.credit.toString(), configure.cryptKey).toString(CryptoJS.enc.Utf8).split('/');
//   source.number = creditArr[0];
//   source.exp_year = parseInt(creditArr[2]);
//   source.cvc = parseInt(creditArr[3])
//
//   const months = creditArr[1].split(' ');
//   source.exp_month = parseInt(months[1]) - 1;
//
//   stripe.customers.create({
//     email: req.user.email
//   }).then((customer) => {
//     return stripe.customers.createSource(customer.id, {
//       source: source
//     });
//   }).then((charge) => {
//     return stripe.charges.create({
//       amount: req.body.cost,
//       currency: 'usd',
//       customer: source.customer
//     });
//   }).then((source) => {
//     console.log("yay!", source);
//     next();
//   }).catch((err) => {
//     next(err);
//   })
// };

module.exports = {
  // chargeClient: chargeClient,
  // checkDates: checkDates,
  modifyTime: modifyTime,
  // getRooms: getRooms,
  getRoom: getRoom,
  // getRes: getRes,
  getAvailable: getAvailable,
  sendMessage: sendMessage,
  sendReminder: sendReminder,
  sendCancel: sendCancel,
  findUser: findUser
};
