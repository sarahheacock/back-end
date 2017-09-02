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
  User.findById(id, {userID: 1, email: 1}).exec((err, doc) => {
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
reservationRoutes.get('/available/:dateOne/:dateTwo/:guests', mid.getRooms, mid.getRes, (req, res, next) => {
  let resObj = {};
  req.reservations.forEach((saved) => {
    if(!resObj[saved.roomID]) resObj[saved.roomID] = 1;
    else resObj[saved.roomID] = resObj[saved.roomID] + 1;
  });

  const result = req.rooms.filter((room) => {
    if(!resObj[room._id]) return true;
    else return room.available > resObj[room._id];
  });

  // console.log("reservations", req.reservations, result);
  res.json(result);
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
reservationRoutes.post('/user/:userID', auth, mid.getRoom, mid.sendMessage, (req, res, next) => {
  let stay = new Reservation(req.body);
  stay.userID = req.params.userID;

  stay.save((err, newStay) => {
    if(err) next(err);
    res.json({edit: data.initialEdit, message: data.messages.userRes});
  });
});

//===============RESERVATIONS THAT REQUIRE ADMIN AUTH==================
//get reservations by month

//create user
reservationRoutes.get('/page/:pageID', (req, res, next) => {
  // Reservation.find({}, (err, doc) => {
  //   if(err) next(err);
  //   res.json(doc);
  // });
});

reservationRoutes.post('/page/:pageID', (req, res, next) => {
  // const stay = new Reservation({
  //   start: start,
  //   end: end,
  //   guests: 2,
  //   cost: 100,
  //   roomID: "59a6f1f732325214ae43741d"
  // });
  //
  // stay.save((err, newStay) => {
  //   if(err) next(err);
  //   console.log(newStay);
  //   res.json(newStay);
  // });
});

//create reservations
//cancel reservations
//send reminder message
//charge client
//check-in client


module.exports = reservationRoutes;
