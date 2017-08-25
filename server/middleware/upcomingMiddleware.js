const Node = require("../models/reservation").Node;
const Reservation = require("../models/reservation").Reservation;
const root = require('../configure/config').root;
const async = require("async");
const each = require("async/each");
const parallel = require("async/parallel");
// const data = require('../../data/data');

const look = (nodeID, i, next, req) => {
  Node.findById(nodeID, (err, doc) => {
    if(err || !doc) next(err);
    if(i !== req.params.userID.length - 1){
      return look(doc.children[req.params.userID.charAt(i)], i + 1, next, req);
    }
    else {
      const arrID = doc.reservation[req.params.userID.charAt(i)];
      let arr = [];
      async.each(arrID, (n) => {
        Reservation.findById(n, (err, doc) => {
          if(err || !doc) next(err);
          arr.push(doc);
          if(arr.length === arrID.length){
            req.reservation = arr;
            next();
          }
        });
      });
      // async.parallel([
      //   () => {
      //     Reservation.findById(arrID[0], (err, doc) => {
      //       if(err || !doc) next(err);
      //       arr.push(doc);
      //       if(arr.length === arrID.length){
      //         req.reservation = arr;
      //         next();
      //       }
      //     });
      //   },
      //   () => {
      //     Reservation.findById(arrID[1], (err, doc) => {
      //       if(err || !doc) next(err);
      //       arr.push(doc);
      //       if(arr.length === arrID.length){
      //         req.reservation = arr;
      //         next();
      //       }
      //     });
      //   }
      // ]);
    }
  });
}

const create = (req, res, next) => {
  next();
};

const find = (req, res, next) => {
  look(root, 0, next, req);
  // Reservation.find({'start': req.params.userID}, (err, doc) => {
  //   req.reservation = doc;
  //   next();
  // })
};

module.exports = {
  create: create,
  find: find
};
