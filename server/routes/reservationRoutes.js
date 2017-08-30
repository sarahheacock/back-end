const express = require("express");
const reservationRoutes = express.Router();

const Reservation = require("../models/page").Reservation;
const mid = require('../middleware/upcomingMiddleware');
const auth = require('../middleware/middleware').authorizeUser;

const async = require("async");
const each = require("async/each");


//===================RESERVATIONS================================

//create reservation
reservationRoutes.post('/', (req, res, next) => {
  let reservation = new Reservation(req.body);
  // console.log("reservation", reservation);

  reservation.save((err, reserve) => {
    if(err) next(err);
    else res.json(reserve);
  });
});

//get reservations
reservationRoutes.get('/user/:userID', (req, res, next) => {

});




module.exports = reservationRoutes;
