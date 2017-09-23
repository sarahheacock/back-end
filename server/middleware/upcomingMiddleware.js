const data = require('../../data/data');
const configure = require('../configure/config');
const Room = require("../models/page").Room;
const User = require("../models/page").User;
const Reservation = require("../models/page").Reservation;
const CryptoJS = require('crypto-js');
const jwt = require('jsonwebtoken');

const async = require("async");
const each = require("async/each");

const moment = require('moment');
const stripe = require('stripe')(configure.SecretKey)
const nodemailer = require('nodemailer');
const mg = require('nodemailer-mailgun-transport');

// This is your API key that you retrieve from www.mailgun.com/cp (free up to 10K monthly emails)
const auth = {
  auth: {
    api_key: 'key-8fe0080d32719b30edaa3ac4f24ae053',
    domain: 'sandboxfc3e27202a7c46a084548a6462c6fa6a.mailgun.org'
  }
}
const nodemailerMailgun = nodemailer.createTransport(mg(auth));

const Twilio = require('twilio');
const textClient = new Twilio(
  'AC78f4cac2211a9b4289ce01afd4b2d077',
  'a4f27ac774519b870f03b2ffae392fab'
);

//============================================================
//============================================================
const createMessage = (reservations, task, name) => {
  const roomList = reservations.reduce((a, b) => {
    const start = moment(new Date(b.start)).add(6, 'hours').format('MMMM Do YYYY, h:mm:ss a');
    const end = moment(new Date(b.end)).add(3, 'hours').add(1, 'minutes').format('MMMM Do YYYY, h:mm:ss a');
    const add = start + " - " + end + " in the " + b.roomID.title + " room with " + b.guests + " guest(s)\n";
    a += add;
    return a;
  }, "");

  const total = reservations.reduce((a, b) => {
    a += b.cost;
    return a;
  }, 0);

  let subject = "Confirmation";
  let content = 'Welcome, ' + name + "! We are excited to have you! \n\nYour current reservation is for: \n" + roomList + "\nThis totals to: $" + total + ".00";

  if(task === "checkIn"){
    subject = "Welcome";
    content = 'Welcome, ' + name + "! \n\nYou have received this message because you have just checked in for: \n" + roomList + "\nYou will receive a follow up email with your receipt and confirmation number.";
  }
  else if(task === "remind"){
    subject = "Reminder";
    content = "Hello, " + name + "! \n\nYou are receiving this message because you have an upcoming stay for: \n" + roomList;
  }
  else if(task === "cancel"){
    subject = "Cancel";
    content = "Hello, " + name + "! \n\nWe are sorry to see you go! You are receiving this message because you have canceled for reservation for: \n" + roomList;
  }

  content += "\n\nContact us through our web site or with the number below for any questions, concerns, or cancellations.\n\n\nSincerely,\nB&B\n555-555-5555";
  const html = content.split("\n").reduce((a, b) => {
    if(b === '') a += '<br />'
    else a +='<p>' + b + '</p>';
    return a;
  }, '');

  return {
    subject: subject,
    html: "<div>" + html + "</div>",
    body: content
  };
}

//send email and text message if client elects
const sendMessage = (req, res, next) => {
  if(!req.message){
    const name = (req.user.name) ? req.user.name : req.user.email;
    // const idList = (req.body.reservations) ? req.body.reservations.map((r) => String(r._id)) : [];
    const reservations = req.reservations || req.welcome.filter((w) => { if(req.body.reservations.includes(String(w._id))) return w; });
    const messageObj = createMessage(reservations, req.params.task, name);

    nodemailerMailgun.sendMail({
      from: 'sheacock@kent.edu',
      to: req.user.email, // An array if you have multiple recipients.
      subject: messageObj.subject,
      //You can use "html:" to send HTML email content. It's magic!
      html: messageObj.html,
    },
    (err, info) => {
      let newMessage = (err) ? data.messages.emailError : '';

      if(req.user.billing){
        const phone = req.user.billing.split('/').reduce((a, b) => {
          if(b.includes('+')) return b;
          else if(b === "false") return false;
          else return a;
        }, false);
        console.log(phone);

        if(phone !== false){
          textClient.messages.create({
            from: '+16156453672',
            to: phone,
            body: messageObj.body
          }, (error, message) => {
            console.log(error);
            if(error){
              if(newMessage !== '') req.message = newMessage + " " + data.messages.phoneError;
              else req.message = data.messages.phoneError
            }
            else{
              req.message = newMessage;
            }
            next();
          });
        }
        else{
          req.message = newMessage;
          next();
        }
      }
      else{
        req.message = newMessage;
        next();
      }
    });
  }
  else {
    next();
  }
};

//=====================================================================
const updateCart = (req, res, next) => {
  const start = parseInt(req.body.start);
  const end = parseInt(req.body.end);
  const guests = parseInt(req.body.guests);
  const limit = new Date().setUTCHours(12, 0, 0, 0);

  let dateOne = 0;
  let dateTwo = 0;

  if(start < limit){
    dateOne = new Date().setUTCHours(12, 0, 0, 0);
    dateTwo = dateOne + 23*60*60*1000;
  }
  else{
    if(start >= end) {
      dateOne = new Date(end).setUTCHours(12, 0, 0, 0);
      dateTwo = new Date(start).setUTCHours(11, 59, 0, 0);
    }
    else if(start < end) {
      dateOne = new Date(start).setUTCHours(12, 0, 0, 0);
      dateTwo = new Date(end).setUTCHours(11, 59, 0, 0);
    }
  }
  req.start = dateOne;
  req.end = dateTwo;
  req.guests = guests;

  let cartSize = (req.user) ? req.user.cart.length : 0;

  if(req.body.roomID !== '' && req.body.roomID !== undefined){
    const obj = {
      "start": dateOne,
      "end": dateTwo,
      "guests": guests,
      "roomID": req.body.roomID,
      "cost": req.body.cost
    };

    if(req.user){
      cartSize += 1;
      req.user.cart.push(obj);
    }
    else if(!req.user && req.page){
      const dataObj = (Object.keys(data.signUpAdminData)).reduce((a, b) => {
        a[b] = data.signUpAdminData[b]["default"];
        return a;
      }, {});

      const token = jwt.sign({userID: req.page.userID}, configure.secret, { expiresIn: '1h' });

      const user = (Object.keys(data.initial.user)).reduce((a, b) => {
        if(b === 'token') a.token = token;
        else if(b === 'name') a.name = req.page.name;
        //else if(b === 'cart') a.cart = [obj];
        else if(b === 'admin') a.admin = true;
        else a[b] = data.initial.user[b];
        return a;
      }, {});

      res.json({
        message: data.messages.adminContinueMessage,
        edit: {
          url: '/user/page/' + req.page._id + '?token=' + token,
          modalTitle: 'Submit',
          next: '#',
          dataObj: dataObj
        },
        user: user
      });
    }
    else if(!req.user && !req.page){
      const dataObj = (Object.keys(data.loginData)).reduce((a, b) => {
        a[b] = data.loginData[b]["default"];
        return a;
      }, {});

      res.json({
        message: data.messages.continueMessage,
        edit: {
          url: '/login',
          modalTitle: 'Login',
          next: '#',
          dataObj: dataObj
        }
      });
    }
  }

  if(req.user){
    req.user.save((err, doc) => {
      if(err) next(err);
      if(cartSize > doc.cart.length){
        req.message = data.messages.available;
        next();
      }
      else {
        req.message = '';
        next();
      }
    });
  }
  else{
    req.message = '';
    next();
  }
};

const getAvailable = (req, res, next) => {
  const guests = req.guests;
  const dateOne = req.start;
  const dateTwo = req.end;

  Room.find({"maximum-occupancy": {$gt: guests-1}}, {"maximum-occupancy": 1, "cost": 1, "available": 1, "image": 1, "title": 1}).exec((err, rooms) => {
    if(err) next(err);
    Reservation.find({
      $or:[
        {"start": {$gt: dateOne-1, $lt: dateTwo+1}},
        {"end": {$gt: dateOne-1, $lt: dateTwo+1}},
        {"end": {$lt: dateOne+1}, "start": {$gt: dateTwo-1}}
      ]
    }).exec((err, reservation) => {
      if(err) next(err);

      //add cart items that are relevant to reservations
      const total = (req.user) ? req.user.cart.filter((item) => {
        const inRange = ((item.start >= dateOne && item.start <= dateTwo) || (item.end >= dateOne && item.end <= dateTwo) || (item.start <= dateOne && item.end >= dateTwo));
        if(inRange) return item;
      }).concat(reservation) : reservation;

      const resObj = total.reduce((a, b) => {
        if(!a[b.roomID]) a[b.roomID] = 1;
        else a[b.roomID] = a[b.roomID] + 1;
        return a;
      }, {});

      const days = Math.ceil((dateTwo - dateOne) / (24 * 60 * 60 * 1000));
      const result = rooms.filter((room) => {
        if(!resObj[room._id]) return true;
        else return room.available > resObj[room._id];
      }).map((r) => {
        r.available = r.available - resObj[r._id];
        r.cost *= days;
        return r;
      });


      req.available = result;
      next();
    });
  });
};


const createRes = (req, res, next) => {
  if(req.message === data.messages.available){
    req.message = data.messages.confirmError;
    next();
  }
  else {
    let result = [];
    const end = req.user.cart.length;

    async.each(req.user.cart, (reservation) => {
      let stay = new Reservation(reservation);
      stay.userID = req.user._id;
      //======================================
      stay.save((err, newStay) => {
        if(err) next(err);
        Reservation.populate(newStay, { //=====
          path: 'roomID',
          model: 'Room',
          select: 'image title'
        }, (err, book) => {
          //add populated reservation to result
          result.push(book);
          if(result.length === end){
            req.user.cart = [];
            req.user.save((err, user) => {
              if(err) next(err);
              req.reservations = result;
              return next();
            });
          }
        }); //================================
      });
      //======================================
    });
  }
};


// const deleteRes = (req, res, next) => {
//   Reservation.findById(req.params.resID).populate({
//     path: 'roomID',
//     model: 'Room',
//     select: 'image title'
//   }).exec((err, doc) => {
//     if(err) next(err);
//     req.reservations = [doc];
//     doc.remove((err, stay) => {
//       if(err) next(err);
//       console.log(req.reservations);
//       next();
//     });
//   });
// };

// const getCalendar = (req, res, next) => {
//   const date = (req.params.start) ? new Date(parseInt(req.params.start)) : new Date();
//   const month = (date.getMonth() + 1).toString();
//   const year = date.getFullYear().toString();
//   Reservation.findMonth(month, year, (err, reservations) => {
//     if(err) next(err);
//     req.welcome = reservations;
//     next();
//     //res.json(format(reservations, req.message));
//   });
// };

// const chargeClient = (req, res, next) => {
//   let source = {object: 'card'};
//
//   const creditArr = CryptoJS.AES.decrypt(req.user.credit.toString(), configure.cryptKey).toString(CryptoJS.enc.Utf8).split('/');
//   source.number = creditArr[0];
//   source.exp_year = parseInt(creditArr[2]);
//   source.cvc = parseInt(creditArr[3])
//
//   const months = creditArr[1].split(' ');
//   source.exp_month = parseInt(months[1]) - 1;
//
//   stripe.customers.create({
//     email: req.user.email
//   }).then((customer) => {
//     return stripe.customers.createSource(customer.id, {
//       source: source
//     });
//   }).then((charge) => {
//     return stripe.charges.create({
//       amount: req.body.cost,
//       currency: 'usd',
//       customer: source.customer
//     });
//   }).then((source) => {
//     console.log("yay!", source);
//     next();
//   }).catch((err) => {
//     next(err);
//   })
// };

module.exports = {
  createRes: createRes,
  // deleteRes: deleteRes,
  getAvailable: getAvailable,
  // getRes: getRes,
  updateCart: updateCart,
  sendMessage: sendMessage,
};
