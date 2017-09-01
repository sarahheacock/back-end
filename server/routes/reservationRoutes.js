const express = require("express");
const reservationRoutes = express.Router();
const data = require('../../data/data');

const Reservation = require("../models/page").Reservation;
const Page = require("../models/page").Page;
const Room = require("../models/page").Room;
const User = require("../models/page").User;

const mid = require('../middleware/upcomingMiddleware');
const auth = require('../middleware/middleware').authorizeUser;

const async = require("async");
const each = require("async/each");

reservationRoutes.param("pageID", (req, res, next, id) => {
  Page.findById(id, {userID: 1}).exec((err, doc) => {
    if(err) return next(err);
    if(!doc){
      err = new Error("Page Not Found");
      err.status = 404;
      return next(err);
    }
    req.page = doc;
    return next();
  });
});

reservationRoutes.param("userID", (req, res, next, id) => {
  User.findById(id, {userID: 1}).exec((err, doc) => {
    if(err) return next(err);
    if(!doc){
      err = new Error("User Not Found");
      err.status = 404;
      return next(err);
    }
    req.user = doc;
    return next();
  });
});

//===================RESERVATIONS================================
//get reservations by specified dates and return availability
reservationRoutes.get('/available/:dateOne/:dateTwo/:guests', mid.getRooms, (req, res, next) => {
  Reservation.find({
    $or:[
      {"start": {$gt: req.params.dateOne-1, $lt: req.params.dateTwo+1}},
      {"end": {$gt: req.params.dateOne-1, $lt: req.params.dateTwo+1}}
    ]
  },
  { roomID: 1 }).exec((err, reservation) => {
    if(err) next(err);

    let resObj = {};
    reservation.forEach((saved) => {
      if(!resObj[saved.roomID]) resObj[saved.roomID] = 1;
      else resObj[saved.roomID] = resObj[saved.roomID] + 1;
    });

    const result = req.rooms.filter((room) => {
      if(!resObj[room._id]) return true;
      else return room.available > resObj[room._id];
    });
    res.json(result);
  });
});

//===============RESERVATIONS THAT REQUIRE USER AUTH==============
//get reservations by user id
reservationRoutes.get('/user/:userID', (req, res, next) => {
  Reservation.find({
    userID: req.params.userID
  }).populate({
    path: 'roomID',
    model: 'Room',
    select: 'image title'
  }).exec((err, doc) => {
    if(err) next(err);
    if(res.length === 0) res.json({message: "No upcoming reservations."});
    res.json(doc);
  });
});

//user create reservation
reservationRoutes.post('/user/:userID', (req, res, next) => {
  let start = new Date().getTime();
  let end = start + 24 * 60 * 60 * 1000;
  // const days = (end - start) / (24 * 60 * 60 * 1000);

  let stay = new Reservation({
    start: start,
    end: end,
    guests: 2,
    roomID: "59a6f1f732325214ae43741d",
    cost: 100,
    userID: req.params.userID
  });

  stay.save((err, newStay) => {
    if(err) next(err);
    res.json({edit: data.initialEdit, message: data.messages.userRes})
    // Reservation.findById(newStay._id).populate({
    //   path: 'userID',
    //   model: 'User'
    // }).populate({
    //   path: 'roomID',
    //   model: 'Room'
    // }).exec((err, doc) => {
    //   if(err) next(err);
    //   res.json(doc);
    // });
  });
});

//===============RESERVATIONS THAT REQUIRE ADMIN AUTH==================
//get reservations by month
//create user
//create reservations
//cancel reservations
//charge client
//check-in client


module.exports = reservationRoutes;
