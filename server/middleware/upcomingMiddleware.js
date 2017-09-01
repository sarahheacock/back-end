const data = require('../../data/data');
const configure = require('../configure/config');
const Room = require("../models/page").Room;
const CryptoJS = require('crypto-js');

const stripe = require('stripe')(configure.SecretKey)

// const getRoom = (req, res, next) => {
//   Room.findById("59a6f1f732325214ae43741d", {"maximum-occupancy": 1, "cost": 1}).exec((err, room) => {
//     if(err || !room) next(err);
//     req.room = room;
//   });
// };

const getRooms = (req, res, next) => {
  Room.find({"maximum-occupancy": {$gt: req.params.guests-1}}, {"maximum-occupancy": 1, "cost": 1, "available": 1, "image": 1, "title": 1}).exec((err, rooms) => {
    if(err) next(err);
    req.rooms = rooms;
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
  getRooms: getRooms
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
