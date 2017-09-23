const express = require("express");
const reservationRoutes = express.Router();
const messages = require('../../data/data').messages;

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

reservationRoutes.param("task", (req, res, next, id) => {
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
  if(req.message !== messages.confirmError) res.json(req.body);
  else next();
}, formatOutput.pop, formatOutput.formatOutput);

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
  if(req.message !== messages.confirmError) res.json(req.body);
  else next();
}, formatOutput.pop, formatOutput.formatOutput);

//get reservations by month
reservationRoutes.get('/page/:pageID/:month/:year', auth, (req, res, next) => {
  Reservation.findMonth(req.params.month, req.params.year, (err, reservations) => {
    if(err) next(err);
    req.welcome = reservations.map((r) => {
      return {
        start: new Date(r.start),
        end: new Date(r.end),
        title: r.userID.email,
        event: {
          user: r.userID._id,
          checkedIn: r.charged,
          reminded: r.reminded,
          charged: r.charged
        }
      };
    });
    next();
  });
}, formatOutput.formatOutput);


//charge client
//send reminder message => task === "reminder"
//send checked in message => task === "checkIn"
reservationRoutes.put("/page/:pageID/:task/:userID/", auth, mid.sendMessage, (req, res, next) => {
  let i = 0;
  console.log(req.message);
  // const idList = req.body.reservations.map((r) => String(r._id));

  async.each(req.welcome, (doc) => {
    console.log(doc._id);
    if(req.body.reservations.includes(String(doc._id)) && !req.message.includes("email")){
      console.log("YAY");
      if(req.params.task === "checkIn") doc.checkedIn = true; //change later
      if(req.params.task === "reminder") doc.reminded = true;
      if(req.params.task === "charge") doc.charged = true;

      doc.save((err, old) => {
        if(err) next(err);
        i++;
        if(i === req.welcome.length) next();
      });
    }
    else{
      i++;
      if(i === req.welcome.length) next();
    }
  });

}, formatOutput.pop, formatOutput.formatOutput);

//cancel reservations
//task = "cancel"
reservationRoutes.delete("/page/:pageID/:task/:userID/", auth, mid.sendMessage, (req, res, next) => {
  let i = 0;
  const end = req.welcome.length;
  let result = [];
  // const idList = req.body.reservations.map((r) => String(r._id));

  async.each(req.welcome, (doc) => {
    if(req.body.reservations.includes(String(doc._id)) && !req.message.includes("email")){
      console.log(doc._id);
      doc.remove((err, old) => {
        if(err) next(err);
        i++;
        if(i >= end){
          //req.welcome = result;
          next();
        }
      });
    }
    else{
      i++;
      //result.push(doc);
      if(i >= end){
        //req.welcome = result;
        next();
      }
    }
  });
}, formatOutput.pop, formatOutput.formatOutput);






module.exports = reservationRoutes;
