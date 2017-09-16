const express = require("express");
const reservationRoutes = express.Router();
const data = require('../../data/data');

const Reservation = require("../models/page").Reservation;
const Page = require("../models/page").Page;
const Room = require("../models/page").Room;
const User = require("../models/page").User;

const CryptoJS = require('crypto-js');
const configure = require('../configure/config');
const jwt = require('jsonwebtoken');

const mid = require('../middleware/upcomingMiddleware');
const auth = require('../middleware/middleware').authorizeUser;

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
  if(id === 'undefined'){
    req.user = false;
    return next();
  }
  else{
    User.findById(id).exec((err, doc) => {
      if(err) return next(err);
      if(!doc){
        err = new Error("User Not Found");
        err.status = 404;
        return next(err);
      }
      req.user = doc;
      return next();
    });
  }
});

reservationRoutes.param("start", (req, res, next, id) => {
  const start = new Date(parseInt(id)).setUTCHours(12, 0, 0, 0);
  Reservation.find({userID: req.params.userID, start: start}).populate({
    path: 'roomID',
    model: 'Room',
    select: 'image title'
  }).populate({
    path: 'userID',
    model: 'User',
    select: 'credit billing name email'
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
//========================================================================
const format = (reservations, message) => {
  const newRes = reservations.map((r) => {
    let credit = CryptoJS.AES.decrypt(r.userID.credit.toString(), r.userID.userID).toString(CryptoJS.enc.Utf8);
    // credit.split('/');
    r.userID.credit = credit.split('/').reduce((a, b) => {
      if(b.length === 16) return "xxxx xxxx xxxx " + b.slice(-4);
      else return a;
    }, "");

    delete r.userID.userID;

    return{
      start: new Date(r.start),
      end: new Date(r.end),
      title: r.userID.name || r.userID.email,
      event: r
    };
  });
  const newMessage = (message) ? message: '';
  return {message: newMessage, welcome: newRes, edit: data.initial.edit};
};

const formatOutput = (obj, body) => {
  return (Object.keys(data.initial.user)).reduce((a, k) => {
    // if(k === 'credit' && obj.credit !== '' && obj.credit !== undefined) user[k] = CryptoJS.AES.decrypt(obj[k].toString(), obj.userID).toString(CryptoJS.enc.Utf8);
    // else
    if(k === 'token' && body) a[k] = jwt.sign({userID: body.userID}, configure.secret, { expiresIn: '1h' });
    else if(k === 'token' && !body) a[k] = jwt.sign({userID: obj.userID}, configure.secret, { expiresIn: '1h' });
    else if(k === 'name' && body) a[k] = body.name;
    else if(k === 'admin' && body) a[k] = true;
    else if(k === 'admin' && !body) a[k] = false;
    else if(!obj) a[k] = data.initial.user[k];
    else if(!obj[k]) a[k] = data.initial.user[k];
    else a[k] = obj[k];

    return a;
  }, {});
}

//===================RESERVATIONS================================
//this route is for when user's token is not defined yet
//if user tries to add cart item, login modal will pop up
reservationRoutes.post('/available/', mid.updateCart, mid.getAvailable, (req, res, next) => {
  let newItem = {
    "start": req.start,
    "end": req.end,
    "guests": req.guests,
    "roomID": '',
    "cost": 0
  };

  res.json({
    book: {
      reservation: newItem,
      available: req.available
    },
    message: req.message
  });
});

reservationRoutes.post('/available/:userID', auth, mid.updateCart, mid.getAvailable, (req, res, next) => {
  let newItem = {
    "start": req.start,
    "end": req.end,
    "guests": req.guests,
    "roomID": '',
    "cost": 0
  };

  res.json({
    book: {
      reservation: newItem,
      available: req.available
    },
    user: formatOutput(req.user),
    message: req.message,
    edit: data.initial.edit
  });
});

//if userID is not defined and client tries to item to cart, modal requesting email will pop up
reservationRoutes.post('/available/:userID/:pageID', auth, mid.updateCart, mid.getAvailable, (req, res, next) => {
  let newItem = {
    "start": req.start,
    "end": req.end,
    "guests": req.guests,
    "roomID": '',
    "cost": 0
  };

  res.json({
    book: {
      reservation: newItem,
      available: req.available
    },
    user: formatOutput(req.user, req.page),
    message: req.message,
    edit: data.initial.edit
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
reservationRoutes.post('/user/:userID', auth, mid.updateCart, mid.createRes, mid.sendMessage, (req, res, next) => {
  res.json({
    book: data.initial.book,
    message: data.messages.userRes,
    user: formatOutput(req.user)
  });
});

//===============RESERVATIONS THAT REQUIRE ADMIN AUTH==================
//create users and reservations
reservationRoutes.post('/page/:pageID/:userID', auth, mid.updateCart, mid.createRes, mid.sendMessage, (req, res, next) => {
  res.json({
    book: data.initial.book,
    message: data.messages.userRes,
    user: formatOutput(null, req.page)
  });
});

//get reservations by month
reservationRoutes.get('/page/:pageID/:month/:year', auth, (req, res, next) => {
  Reservation.findMonth(req.params.month, req.params.year, (err, reservations) => {
    if(err) next(err);
    res.json(format(reservations, req.message));
  });
});

//charge client
reservationRoutes.put("/page/:pageID/charge/:userID/:start", auth, (req, res, next) => {
  let i = 1;
  async.each(req.reservations, (reservation) => {
    reservation.charged = true; //change later
    //reservation.checkedIn = true;
    reservation.save((err, doc) => {
      if(err) next(err);
      i++;
      if(i === req.reservations.length){
        const date = new Date(doc.start);
        const month = (date.getMonth() + 1).toString();
        const year = date.getFullYear().toString();
        Reservation.findMonth(month, year, (err, reservations) => {
          if(err) next(err);
          res.json(format(reservations, req.message));
        });
      }
    });
  });
});


//send reminder message => task === "reminder"
//send checked in message => task === "checkIn"
reservationRoutes.put("/page/:pageID/:task/:userID/:start", auth, (req, res, next) => {
  const change = (req.params.task === "checkIn") ? {checkedIn: true} : {reminded: true};
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
}, mid.sendMessage, (req, res, next) => {
  const date = new Date(parseInt(req.params.start));
  const month = (date.getMonth() + 1).toString();
  const year = date.getFullYear().toString();
  Reservation.findMonth(month, year, (err, reservations) => {
    if(err) next(err);
    res.json(format(reservations, req.message));
  });
});

//cancel reservations
//task = "cancel"
reservationRoutes.delete("/page/:pageID/:task/:userID/:resID/", auth, mid.deleteRes, mid.sendMessage, (req, res, next) => {
  const date = new Date(req.reservations[0]["start"]);
  const month = (date.getMonth() + 1).toString();
  const year = date.getFullYear().toString();
  Reservation.findMonth(month, year, (err, reservations) => {
    if(err) next(err);
    res.json(format(reservations, req.message));
  });
});




module.exports = reservationRoutes;
