const express = require("express");
const reservationRoutes = express.Router();

const Node = require("../models/reservation").Node;
const Reservation = require("../models/reservation").Reservation;
const root = require('../configure/config').root;
const mid = require('../middleware/upcomingMiddleware');


// reservationRoutes.param("userID", (req, res, next, id) => {
//   Node.findById(id, (err, doc) => {
//     if(err) return next(err);
//     if(!doc){
//       err = new Error("Root Not Found");
//       err.status = 404;
//       return next(err);
//     }
//     req.root = doc;
//     return next();
//   });
// });



//===================UPCOMING================================

//it should return reservation based on month
//it should get reservation based on userID
//it should create reservation with token
reservationRoutes.get('/', (req, res, next) => { //create root
  const root = new Node();

  root.save((err, start) => {
    if(err) next(err);
    res.json(start);
  });
});



//get reservation
reservationRoutes.post('/', (req, res, next) => {
  const date = new Date("May 22, 2021").getTime();
  let reservation = new Reservation({
    start: date,
    end: date + (10*24*60*60*1000),
    event: {
      userID: "abcd"
    },
  });
  // console.log("reservation", reservation);

  reservation.save((err, reserve) => {
    if(err) next(err);
    else res.json(reserve);
  });
});

//get reservation
reservationRoutes.get('/:userID', mid.find, (req, res, next) => {
  res.json(req.reservation);
});




module.exports = reservationRoutes;
