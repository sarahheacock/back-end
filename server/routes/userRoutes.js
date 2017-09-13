const express = require("express");
const userRoutes = express.Router();
const User = require("../models/page").User;
const Page = require("../models/page").Page;
const mid = require('../middleware/middleware');

const configure = require('../configure/config');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const CryptoJS = require('crypto-js');

const initialUser = require('../../data/data').initial.user;
const initialMessage = require('../../data/data').initial.message;
const initialEdit = require('../../data/data').initial.edit;

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
  User.findById(id, (err, doc) => {
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

//=============================================================
const formatOutput = (obj, body) => {

  let user = {};
  Object.keys(initialUser).forEach((k) => {
    // if(k === 'credit' && obj[k] !== '') user[k] = CryptoJS.AES.decrypt(obj[k].toString(), obj.userID).toString(CryptoJS.enc.Utf8);
    // else 
    if(k === 'token' && body) user[k] = jwt.sign({userID: body.userID}, configure.secret, { expiresIn: '1h' });
    else if(k === 'token' && !body) user[k] = jwt.sign({userID: obj.userID}, configure.secret, { expiresIn: '1h' });
    else if(k === 'name' && body) user[k] = body.name;
    else if(!obj[k]) user[k] = initialUser[k];
    else user[k] = obj[k];
  });

  return {user: user, edit: initialEdit, message: initialMessage};
}


//===================USER SECTIONS================================
userRoutes.post('/user', mid.checkSignUpInput, (req, res, next) => {
  let user = new User(req.body);

  bcrypt.hash(user.password, 10, (err, hash) => {
    if(err) return next(err);
    user.password = hash;

    user.save((err, page) => {
      if(err) res.json({message: "This email already has an account associated with it."})
      res.status(201);
      res.json(formatOutput(user, null));
    });
  });
});

userRoutes.get('/user/:userID', mid.authorizeUser, (req, res, next) => {
  res.json(formatOutput(req.user, null));
});

//update page content
userRoutes.put('/user/:userID/:userInfo/', mid.authorizeUser, mid.checkUserInput, (req, res, next) => {
  if(Array.isArray(req.user[req.params.userInfo])) req.user.cart.push(req.newOutput);
  else req.user[req.params.userInfo] = req.newOutput;

  req.user.save((err,user) => {
    if(err) return next(err);
    res.status(200);
    res.json(formatOutput(user, null));
  });
})

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
        res.status(201);
        res.json(formatOutput(newUser, req.page));
      });
    }
    else {
      res.json(formatOutput(doc, req.page));
    }
  });
});

userRoutes.get('/page/:pageID/:userID/', mid.authorizeUser, (req, res, next) => {
  res.json(formatOutput(req.user, req.page));
});


//update page content
userRoutes.put('/page/:pageID/:userID/:userInfo/', mid.authorizeUser, mid.checkUserInput, (req, res, next) => {
  if(Array.isArray(req.user[req.params.userInfo])) req.user.cart.push(req.newOutput);
  else req.user[req.params.userInfo] = req.newOutput;

  req.user.save((err,user) => {
    if(err) return next(err);
    res.status(200);
    res.json(formatOutput(user, req.page));
  });
});



module.exports = userRoutes;
