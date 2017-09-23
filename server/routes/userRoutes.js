const express = require("express");
const userRoutes = express.Router();
const User = require("../models/page").User;
const Page = require("../models/page").Page;
const Room = require("../models/page").Room;
const mid = require('../middleware/middleware');
const formatOutput = require('../middleware/userOutput').formatOutput;

const configure = require('../configure/config');
const bcrypt = require('bcrypt');
const CryptoJS = require('crypto-js');
const jwt = require('jsonwebtoken');


userRoutes.param("pageID", (req, res, next, id) => {
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

userRoutes.param("userID", (req, res, next, id) => {
  User.findById(id).populate({
    path: 'cart.roomID',
    //populate: {
    //path: 'roomID',
    model: 'Room',
    select: 'image title'
    //}
  }).exec((err, doc) => {
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


//===================USER SECTIONS================================
userRoutes.post('/user', mid.checkSignUpInput, (req, res, next) => {
  let user = new User(req.body);

  bcrypt.hash(user.password, 10, (err, hash) => {
    if(err) return next(err);
    user.password = hash;

    user.save((err, page) => {
      if(err) res.json({message: "This email already has an account associated with it."})
      res.status(201);
      req.user = page;
      next();
      //res.json(formatOutput(user, null));
    });
  });
}, formatOutput);

userRoutes.get('/user/:userID', mid.authorizeUser, (req, res, next) => {
  req.user.save((err, doc) => {
    if(err) next(err);
    //req.user = doc;
    next();
    // res.json(formatOutput(doc, null));
  });
}, formatOutput);

//update page content
userRoutes.put('/user/:userID/:userInfo/', mid.authorizeUser, mid.checkUserInput, (req, res, next) => {
  //if(Array.isArray(req.user[req.params.userInfo])) req.user.cart.push(req.newOutput);
  if(req.params.userInfo === "cart") req.user.cart.splice(req.user.cart.indexOf(req.body), 1);
  else if(req.params.userInfo === "credit") req.user[req.params.userInfo] = CryptoJS.AES.encrypt(req.newOutput, req.user.userID);
  else req.user[req.params.userInfo] = req.newOutput;

  req.user.save((err,user) => {
    if(err && req.params.userInfo === "email") res.json({message: "This new email already has another account associated with it."})
    if(err) return next(err);
    req.user = user;
    next();
    // res.status(200);
    // res.json(formatOutput(user, null));
  });
}, formatOutput);

//======================ADMIN SECTIONS================================
userRoutes.post('/page/:pageID', mid.authorizeUser, mid.checkSignUpInput, (req, res, next) => {
  User.findOne({email: req.body.email}, (err, doc) => {
    if(err) next(err);
    if(!doc){
      let user = new User({
        email: req.body.email,
        name: req.body.name
      });

      user.save((err, newUser) => {
        if(err) next(err);
        req.user = newUser;
        next();
        // res.status(201);
        // res.json(formatOutput(newUser, req.page));
      });
    }
    else {
      //ASK FOR PERMISSION
      const token = jwt.sign({userID: req.page.userID}, configure.secret, { expiresIn: '1h' });
      const billing = doc.billing.split('/').reduce((a, b) => {
        if(b !== "true" && b !== "false"){
          if(isNaN(a.charAt(a.length - 1) && isNaN(b.charAt(0)))) a = a + ", " + b;
          else return a = a + " " + b;
        }
        return a;
      }, '');

      res.json({
        edit: {
          url: '/user/page/' + req.page._id + "/" + doc._id + '?token=' + token,
          modalTitle: 'Continue',
          next: '#',
          dataObj: req.body
        },
        message: "This email already has an account associated with it. Continue with this account: " + billing + " ?"
      })
    }
  });
}, formatOutput);

userRoutes.get('/page/:pageID/:userID/', mid.authorizeUser, (req, res, next) => {
  req.user.save((err, doc) => {
    if(err) next(err);
    req.user = doc;
    next();
    // res.json(formatOutput(doc, req.page));
  });
}, formatOutput);


//update page content
userRoutes.put('/page/:pageID/:userID/:userInfo/', mid.authorizeUser, mid.checkUserInput, (req, res, next) => {
  if(req.params.userInfo === "cart") req.user.cart.splice(req.user.cart.indexOf(req.body), 1);
  else if(req.params.userInfo === "credit") req.user[req.params.userInfo] = CryptoJS.AES.encrypt(req.newOutput, req.user.userID);
  else req.user[req.params.userInfo] = req.newOutput;

  req.user.save((err,user) => {
    if(err && req.params.userInfo === "email") res.json({message: "This new email already has another account associated with it."});
    if(err) return next(err);
    req.user = user;
    next();
    // res.status(200);
    // res.json(formatOutput(user, req.page));
  });
}, formatOutput);

userRoutes.post('/:pageID/', mid.authorizeUser, (req, res, next) => {
  const id = req.body.find;
  User.find({
    $or: [
      { "email": { "$regex": id, "$options": "i" } },
      { "name": { "$regex": id, "$options": "i" } }
    ]
  }, {email: 1, name: 1}).exec((err, doc) => {
    res.json({welcome: doc});
  });
});



module.exports = userRoutes;
