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

reservationRoutes.param("resID", (req, res, next, id) => {
  Reservation.findById(id).populate({
    path: 'roomID',
    model: 'Room',
    select: 'image title'
  }).populate({
    path: 'userID',
    model: 'User',
    select: 'email credit'
  }).exec((err, doc) => {
    if(err) next(err);
    if(!doc){
      err = new Error("Reservation Not Found");
      err.status = 404;
      return next(err);
    }
    req.reservation = doc;
    next();
  })
});

//===================RESERVATIONS================================
//get reservations by specified dates and return availability
reservationRoutes.get('/available/:dateOne/:dateTwo/:guests', mid.getRooms, mid.getRes, (req, res, next) => {
  let resObj = {};
  req.reservations.forEach((saved) => {
    if(!resObj[saved.roomID]) resObj[saved.roomID] = 1;
    else resObj[saved.roomID] = resObj[saved.roomID] + 1;
  });

  const days = Math.ceil((req.params.dateTwo - req.params.dateOne) / (24 * 60 * 60 * 1000));
  const result = req.rooms.filter((room) => {
    if(!resObj[room._id]) return true;
    else return room.available > resObj[room._id];
  }).map((r) => {
    r.cost *= days;
    return r;
  });

  // console.log("reservations", req.reservations, result);
  res.json({
    book: {
      reservation: data.initial.book.reservation,
      available: result
    }
  });
});

//===============RESERVATIONS THAT REQUIRE USER AUTH==============
//get reservations by user id
reservationRoutes.get('/user/:userID', auth, (req, res, next) => {
  Reservation.find({
    userID: req.params.userID
  }).populate({
    path: 'roomID',
    model: 'Room',
    select: 'image title'
  }).exec((err, doc) => {
    if(err) next(err);
    res.json({welcome: doc});
  });
});

//user create reservation
reservationRoutes.post('/user/:userID', auth, mid.modifyTime, mid.getRoom, mid.sendMessage, (req, res, next) => {
  let stay = new Reservation(req.body.book.reservation);
  stay.userID = req.params.userID;

  stay.save((err, newStay) => {
    if(err) next(err);
    res.json({
      book: data.initial.book,
      message: data.messages.userRes
    });
  });
});

//===============RESERVATIONS THAT REQUIRE ADMIN AUTH==================
//create users and reservations
reservationRoutes.post('/page/:pageID', auth, mid.modifyTime, mid.getRoom, mid.findUser, mid.sendMessage, (req, res, next) => {
  let stay = new Reservation(req.body.book.reservation);
  stay.userID = req.user._id;
  stay.save((err, newStay) => {
    if(err) next(err);
    res.json({
      book: data.initial.book,
      message: data.messages.userRes,
      user: {
        token: req.body.user.token,
        _id: req.params.pageID,
        name: req.body.user.name,
        email: '',
        billing: '',
        credit: ''
      }
    });
  });
});


//send reminder message
reservationRoutes.put("/page/:pageID/reminder/:resID", auth, mid.sendReminder, (req, res, next) => {
  req.reservation.reminded = true; //change later
  req.reservation.save((err, doc) => {
    if(err) next(err);
    const date = new Date(doc.start);
    const month = (date.getMonth() + 1).toString();
    const year = date.getFullYear().toString();
    Reservation.findMonth(month, year, (err, reservations) => {
      if(err) next(err);
      res.json({message: "", welcome: reservations, edit: data.initial.edit});
    });
  });
});


//check-in client
reservationRoutes.put("/page/:pageID/checkIn/:resID", auth, (req, res, next) => {
  req.reservation.checkedIn = !req.reservation.checkedIn;
  req.reservation.save((err, doc) => {
    console.log(doc);
    if(err) next(err);
    const date = new Date(doc.start);
    const month = (date.getMonth() + 1).toString();
    const year = date.getFullYear().toString();
    Reservation.findMonth(month, year, (err, reservations) => {
      if(err) next(err);
      res.json({message: "", welcome: reservations, edit: data.initial.edit});
    });
  });
});

//charge client
reservationRoutes.put("/page/:pageID/charge/:resID", auth, (req, res, next) => {
  req.reservation.charged = true; //change later
  req.reservation.checkedIn = true;
  req.reservation.save((err, doc) => {
    if(err) next(err);
    const date = new Date(doc.start);
    const month = (date.getMonth() + 1).toString();
    const year = date.getFullYear().toString();
    Reservation.findMonth(month, year, (err, reservations) => {
      if(err) next(err);
      res.json({message: "", welcome: reservations, edit: data.initial.edit});
    });
  });
});

//cancel reservations
reservationRoutes.delete("/page/:pageID/cancel/:resID/", auth, mid.sendCancel, (req, res, next) => {
  req.reservation.remove((err, doc) => {
    if(err) next(err);
    const date = new Date(doc.start);
    const month = (date.getMonth() + 1).toString();
    const year = date.getFullYear().toString();
    Reservation.findMonth(month, year, (err, reservations) => {
      if(err) next(err);
      res.json({message: "", welcome: reservations, edit: data.initial.edit});
    });
  });
});

//get reservations by month
reservationRoutes.get('/page/:pageID/:month/:year', auth, (req, res, next) => {
  Reservation.findMonth(req.params.month, req.params.year, (err, reservations) => {
    if(err) next(err);
    res.json({message: "", welcome: reservations, edit: data.initial.edit});
  });
});




module.exports = reservationRoutes;
