const express = require("express");
const reservationRoutes = express.Router();
const data = require('../../data/data');

const Reservation = require("../models/page").Reservation;
const Page = require("../models/page").Page;
const Room = require("../models/page").Room;
const User = require("../models/page").User;

const CryptoJS = require('crypto-js');

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
  User.findById(id, {userID: 1, email: 1, cart: 1}).exec((err, doc) => {
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

const format = (reservations) => {
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
  return {message: "", welcome: newRes, edit: data.initial.edit};
};

//===================RESERVATIONS================================
//get reservations by specified dates and return availability
reservationRoutes.get('/available/:userID/:dateOne/:dateTwo/:guests', mid.getAvailable, (req, res, next) => {
  res.json({
    book: {
      reservation: {
        "start": req.dateOne,
        "end": req.dateTwo,
        "guests": parseInt(req.params.guests),
        "roomID": '',
        "cost": 0
      },
      available: req.available
    }
  });
});

reservationRoutes.post('/available/:userID/:dateOne/:dateTwo/:guests', mid.getAvailable, (req, res, next) => {
  let newItem = {
    "start": req.dateOne,
    "end": req.dateTwo,
    "guests": parseInt(req.params.guests),
    "roomID": '',
    "cost": 0
  };
  req.user.cart.push(newItem);
  req.user.save((err, user) => {
    if(err) next(err);
    let output = req.body.user;
    output.cart = user.cart;

    res.json({
      book: {
        reservation: newItem,
        available: req.available
      },
      user: output
    });
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
// mid.modifyTime, mid.getRoom
reservationRoutes.post('/user/:userID', mid.getRoom, mid.sendMessage, (req, res, next) => {
  res.json({
    rooms: req.room,
    cart: req.user.cart
  });
  async.each(req.user.cart, (reservation) => {
    let stay = new Reservation(reservation);
    stay.userID = req.params.userID;

    // let user = req.body.user;
    // user.cart = [];
    //
    // stay.save((err, newStay) => {
    //   if(err) next(err);
    //   res.json({
    //     book: data.initial.book,
    //     message: data.messages.userRes,
    //     user: user
    //   });
    // });
  });

});

//===============RESERVATIONS THAT REQUIRE ADMIN AUTH==================
//create users and reservations
reservationRoutes.post('/page/:pageID/:userID', auth, mid.modifyTime, mid.getRoom, mid.findUser, mid.sendMessage, (req, res, next) => {
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
        credit: '',
        cart: []
      }
    });
  });
});


//send reminder message
reservationRoutes.put("/page/:pageID/reminder/:resID", auth, mid.sendReminder, (req, res, next) => {
  req.reservation.reminded = true;
  req.reservation.save((err, doc) => {
    if(err) next(err);
    const date = new Date(doc.start);
    const month = (date.getMonth() + 1).toString();
    const year = date.getFullYear().toString();
    Reservation.findMonth(month, year, (err, reservations) => {
      if(err) next(err);
      res.json(format(reservations));
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
      res.json(format(reservations));
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
      res.json(format(reservations));
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
      res.json(format(reservations));
    });
  });
});

//get reservations by month
reservationRoutes.get('/page/:pageID/:month/:year', auth, (req, res, next) => {
  Reservation.findMonth(req.params.month, req.params.year, (err, reservations) => {
    if(err) next(err);
    res.json(format(reservations));
  });
});




module.exports = reservationRoutes;
