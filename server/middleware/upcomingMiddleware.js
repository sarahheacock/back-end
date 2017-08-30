


module.exports = {

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
