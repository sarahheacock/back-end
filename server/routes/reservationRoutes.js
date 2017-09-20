const express = require("express");
const reservationRoutes = express.Router();
// const data = require('../../data/data');

const Reservation = require("../models/page").Reservation;
const Page = require("../models/page").Page;
const Room = require("../models/page").Room;
const User = require("../models/page").User;

// const { URL } = require('url');

const mid = require('../middleware/upcomingMiddleware');
const auth = require('../middleware/middleware').authorizeUser;
const formatOutput = require('../middleware/userOutput');

const async = require("async");
const each = require("async/each");

reservationRoutes.param("pageID", (req, res, next, id) => {
  Page.findById(id, {userID: 1, name: 1}).exec((err, doc) => {
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
  User.findById(id)
  .exec((err, doc) => {
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

reservationRoutes.param("end", (req, res, next, id) => {
  const start = new Date(parseInt(req.params.start)).setUTCHours(12, 0, 0, 0);
  const end = new Date(parseInt(id)).setUTCHours(11, 59, 0, 0);
  Reservation.find({userID: req.params.userID, start: start, end: end}).populate({
    path: 'roomID',
    model: 'Room',
    select: 'image title'
  }).populate({
    path: 'userID',
    model: 'User',
    select: 'credit billing name email userID'
  }).exec((err, doc) => {
    if(err) next(err);
    if(!doc){
      err = new Error("Reservation Not Found");
      err.status = 404;
      return next(err);
    }
    req.reservations = doc;
    next();
  });
});

//===================RESERVATIONS================================
//this route is for when user's token is not defined yet
//if user tries to add cart item, login modal will pop up
reservationRoutes.post('/available/', mid.updateCart, mid.getAvailable, formatOutput.formatOutput);

reservationRoutes.post('/available/user/:userID', auth, mid.updateCart, mid.getAvailable, formatOutput.pop, formatOutput.formatOutput);

//if userID is not defined and client tries to item to cart, modal requesting email will pop up
reservationRoutes.post('/available/page/:pageID', auth, mid.updateCart, mid.getAvailable, formatOutput.formatOutput);

reservationRoutes.post('/available/page/:pageID/:userID', auth, mid.updateCart, mid.getAvailable, formatOutput.pop, formatOutput.formatOutput);

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
    req.welcome = doc;
    next();
  });
}, formatOutput.pop, formatOutput.formatOutput);

//user create reservation
reservationRoutes.post('/user/:userID', auth, mid.updateCart, mid.createRes, mid.sendMessage, (req, res, next) => {
  //CHANGE TO REDIRECT TO WELCOME
  //WELCOME WILL CALL GET /USER/USER/:USERID
  res.json(req.body);
});

//===============RESERVATIONS THAT REQUIRE ADMIN AUTH==================
reservationRoutes.get('/page/:pageID/:userID', auth, (req, res, next) => {
  Reservation.find({
    userID: req.params.userID
  }).populate({
    path: 'roomID',
    model: 'Room',
    select: 'image title'
  }).exec((err, doc) => {
    if(err) next(err);
    req.welcome = doc;
    next();
  });
}, formatOutput.pop, formatOutput.formatOutput);

//create users and reservations
reservationRoutes.post('/page/:pageID/:userID', auth, mid.updateCart, mid.createRes, mid.sendMessage, (req, res, next) => {
  //CHANGE TO REDIRECT TO WELCOME
  //WELCOME WILL CALL GET /USER/PAGE/:PAGEID/:MONTH/:YEAR
  //res.redirect('/welcome');
  res.json(req.body);
});

//get reservations by month
reservationRoutes.get('/page/:pageID/:month/:year', auth, (req, res, next) => {
  Reservation.findMonth(req.params.month, req.params.year, (err, reservations) => {
    if(err) next(err);
    req.welcome = reservations;
    next();
  });
}, formatOutput.formatOutput);

//cancel reservations
//task = "cancel"
reservationRoutes.delete("/page/:pageID/:task/:userID/:resID/", auth, mid.deleteRes, mid.sendMessage, mid.getCalendar, formatOutput.pop, formatOutput.formatOutput);

//charge client
reservationRoutes.put("/page/:pageID/charge/:userID/:start/:end", auth, (req, res, next) => {
  let i = 1;
  async.each(req.reservations, (reservation) => {
    reservation.charged = true; //change later
    //reservation.checkedIn = true;
    reservation.save((err, doc) => {
      if(err) next(err);
      i++;
      if(i === req.reservations.length){
        next();
      }
    });
  });
}, mid.getCalendar, formatOutput.pop, formatOutput.formatOutput);


//send reminder message => task === "reminder"
//send checked in message => task === "checkIn"
reservationRoutes.put("/page/:pageID/:task/:userID/:start/:end", auth, (req, res, next) => {
  //const change = (req.params.task === "checkIn") ? {checkedIn: true} : {reminded: true};
  let i = 0;
  async.each(req.reservations, (reservation) => {
    if(req.params.task === "checkIn")reservation.checkedIn = true; //change later
    if(req.params.task === "reminder")reservation.reminded = true;

    reservation.save((err, doc) => {
      if(err) next(err);
      i++;
      if(req.reservations.length === i){
        next();
      }
    });
  });
}, mid.sendMessage, mid.getCalendar, formatOutput.pop, formatOutput.formatOutput);






module.exports = reservationRoutes;
