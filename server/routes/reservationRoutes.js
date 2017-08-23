const express = require("express");
const reservationRoutes = express.Router();

const Node = require("../models/reservation").Node;
const Reservation = require("../models/reservation").Reservation;

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
reservationRoutes.get('/', (req, res, next) => { //create root
  const root = new Node();

  root.save((err, start) => {
    if(err) next(err);
    res.json(start);
  });
});

//get reservation
// reservationRoutes.get('/:upcomingID', (req, res, next) => {
//   const newRes = {
//     userID: "598f"
//   };
//
//   let node = req.root;
//   const arr = newRes.userID.split('')
//
//   for(let i = 0; i < arr.length; ) {
//
//     const letter = newRes.userID.charAt(i);
//     let num = (letter > '9') ? letter - ('a' - 10) : letter - '0';
//     if(node.children[num] === null){
//       res.json({message: "No reservation"});
//     }
//     else {
//       Upcoming.findById(node.children[num], (err, u) => {
//         if(err) return next(err);
//         node = u;
//         i++;
//       });
//     }
//
//   }
//
//   res.json(node.reservation);
// });

//get reservation
reservationRoutes.post('/', (req, res, next) => {
  const date = new Date("Aug 22, 2017").getTime();
  let reservation = new Reservation({
    start: date,
    end: date + (2*24*60*60*1000),
    event: {
      userID: "abcd"
    },
  });

  // console.log("reservation", reservation);

  reservation.save((err, reserve) => {
    if(err) next(err);
    // else next();
    else res.json(reserve);
  });
});


module.exports = reservationRoutes;
