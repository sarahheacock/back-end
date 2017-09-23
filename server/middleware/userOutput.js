const data = require('../../data/data');
const configure = require('../configure/config');
const Room = require("../models/page").Room;
const User = require("../models/page").User;
// const Reservation = require("../models/page").Reservation;
const CryptoJS = require('crypto-js');
const jwt = require('jsonwebtoken');

const cardType = (num) => {
  const visa = /^(?:4[0-9]{12}(?:[0-9]{3})?)$/.test(num);
  const master = /^(?:5[1-5][0-9]{14})$/.test(num);
  const amn = /^(?:3[47][0-9]{13})$/.test(num);
  const disc = /^(?:6(?:011|5[0-9][0-9])[0-9]{12})$/.test(num);

  if(visa) return "fa fa-cc-visa";
  if(master) return "fa fa-cc-mastercard";
  if(amn) return "fa fa-cc-amex";
  if(dic) return "fa fa-cc-discover";
}

const formatCredit = (str, userID) => {
  //console.log(str);
  if(!str) return data.intitial.user.credit;

  let credit = CryptoJS.AES.decrypt(str.toString(), userID).toString(CryptoJS.enc.Utf8);
  if(!credit.includes("/") || credit.charAt(0) === "/") return data.initial.user.credit;

  let result = [];
  const creditArr = credit.split("/");
  result.push(creditArr[0]);
  result.push(cardType(creditArr[1]));
  result.push("xxxx xxxx xxxx " + creditArr[1].slice(-4));
  result.push(creditArr[2].slice(-2) + " - " + creditArr[3]);

  return result.join("/");
};


const formatOutput = (req, res, next) => {
  //console.log("output", req.user);

  //let welcome = data.initial.welcome;
  let user = {};
  let book = data.initial.book;

  const message = (req.message) ? req.message : data.initial.message;

  const page = !(!req.page);
  const userP = !(!req.user);

  if(userP) { //format user & place page if admin is helping
    user = Object.keys(data.initial.user).reduce((a, b) => {
      if(b === "credit" && req.user.credit) a.credit = formatCredit(req.user.credit, req.user.userID);
      else if(b === "token") a.token = (page) ? jwt.sign({userID: req.page.userID}, configure.secret, { expiresIn: '1h' }) : jwt.sign({userID: req.user.userID}, configure.secret, { expiresIn: '1h' });
      else if(b === "name") a.name = (page) ? req.page.name : req.user.name;
      else if(b === "admin") a.admin = (page) ? true: false;
      else if(req.user[b]) a[b] = req.user[b];
      else a[b] = data.initial.user[b];
      return a;
    }, {});
  }
  else if(!userP && page){ //spit out admin if there is no user;
    if(req.page){
      user.admin = true;
      user.token = jwt.sign({userID: req.page.userID}, configure.secret, { expiresIn: '1h' });
      user.name = req.page.name;
    }

    user = Object.keys(data.initial.user).reduce((a, b) => {
      if(b === "token") a.token = jwt.sign({userID: req.page.userID}, configure.secret, { expiresIn: '1h' });
      else if(b === "name") a.name = req.page.name;
      else if(b === "admin") a.admin = true;
      //else if(req.user[b]) a[b] = req.user[b];
      else a[b] = data.initial.user[b];
      return a;
    }, {});
  }
  else{
    user = data.initial.user;
  }


  if(req.available){
    book.reservation.start = req.start;
    book.reservation.end = req.end;
    book.reservation.guests = req.guests;

    book.available = req.available;
  }

  //if(req.welcome) welcome = req.welcome;
  //else if(req.reservations) welcome = req.reservations;
  let obj = {
    message: message,
    book: book
  };

  if(!message) obj.edit = data.initial.edit;
  if(page || userP) obj.user = user;
  if(req.welcome) obj.welcome = req.welcome;
  if(req.available) obj.welcome = data.initial.welcome;

  res.json(obj);
};

const pop = (req, res, next) => {
  User.populate(req.user, {
    path: 'cart.roomID',
    model: 'Room',
    select: 'image title'
  }, (err, user) => {
    if(err) next(err);
    next();
  });
}

module.exports = {
  formatOutput: formatOutput,
  pop: pop
}

// var initial = {
//   "home": {},
//   "gallery": {},
//   "guide": {},
//   "book": {
//     "reservation": {

//     },
//     "available": []
//   },
//   "welcome": [],
//   "message": '',
//   "edit": {
//     "url": '',
//     "modalTitle": '',
//     "next": '',
//     "dataObj": {}
//   },
//   "user": {
//     "token": '',
//     "admin": false,
//     "_id": '',
//     "name": '',
//     "email": '',
//     "billing": defaultAddress,
//     "credit": defaultPayment,
//     "cart": []
//   }
// }
