const express = require("express");
const reservationRoutes = express.Router();

const Reservation = require("../models/reservation").Reservation;
const root = require('../configure/config').root;
const mid = require('../middleware/upcomingMiddleware');

const async = require("async");
const each = require("async/each");


//===================UPCOMING================================

//it should return reservation based on month
//it should get reservation based on userID
//it should create reservation with token
reservationRoutes.get('/', mid.init, (req, res, next) => { //create root
  res.json(req.root);
});



//get reservation
reservationRoutes.post('/', (req, res, next) => {
  const date = new Date("May 22, 2019").getTime();
  let reservation = new Reservation({
    start: date,
    end: date + (2*24*60*60*1000),
    event: {
      userID: "df2345678"
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
  if(!Array.isArray(req.reservation)) res.json(req.reservation);

  let result = [];
  async.each(req.reservation, (stay) => {
    Reservation.findById(stay, (err, doc) => {
      if(err || !doc) next(err);
      result.push(doc);
      if(result.length === req.reservation.length) res.json(result);
    });
  });

});




module.exports = reservationRoutes;
