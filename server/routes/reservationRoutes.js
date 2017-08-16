const express = require("express");
const reservationRoutes = express.Router();
const Upcoming = require("../models/reservation").Upcoming;
const mid = require('../middleware/upcomingMiddleware');

// reservationRoutes.param("upcomingID", (req, res, next, id) => {
//   Upcoming.findById(id, (err, doc) => {
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
reservationRoutes.get('/', (req, res, next) => {
  const upcoming = new Upcoming({name: 'a'});
  upcoming.children = new Array(16);

  upcoming.save((err, up) => {
    if(err) next(err);
    res.json(up);
  });
});

//get reservation
reservationRoutes.get('/:upcomingID', (req, res, next) => {
  const newRes = {
    userID: "598f"
  };

  let node = req.root;
  const arr = newRes.userID.split('')

  for(let i = 0; i < arr.length; ) {

    const letter = newRes.userID.charAt(i);
    let num = (letter > '9') ? letter - ('a' - 10) : letter - '0';
    if(node.children[num] === null){
      res.json({message: "No reservation"});
    }
    else {
      Upcoming.findById(node.children[num], (err, u) => {
        if(err) return next(err);
        node = u;
        i++;
      });
    }

  }

  res.json(node.reservation);
});

//get reservation
reservationRoutes.post('/:upcomingID', mid.create, (req, res, next) => {
  res.json(req.result);
});


module.exports = reservationRoutes;
