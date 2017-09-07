const express = require("express");
const userRoutes = express.Router();
const User = require("../models/page").User;
const mid = require('../middleware/middleware');

const configure = require('../configure/config');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const CryptoJS = require('crypto-js');


const initialUser = require('../../data/data').initial.user;
const initialMessage = require('../../data/data').initial.message;
const initialEdit = require('../../data/data').initial.edit;


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
const formatOutput = (obj) => {
  const token = jwt.sign({userID: obj.userID}, configure.secret, {
    expiresIn: '1h' //expires in one hour
  });

  let user = {};
  Object.keys(initialUser).forEach((k) => {
    if(k === 'credit' && obj[k] !== '') user[k] = CryptoJS.AES.decrypt(obj[k].toString(), obj.userID).toString(CryptoJS.enc.Utf8);
    else if(obj[k]) user[k] = obj[k];
    else user[k] = initialUser[k];
  });
  user.token = token;
  return {user: user, edit: initialEdit, message: initialMessage};
}


//===================USER SECTIONS================================

userRoutes.post('/', mid.checkSignUpInput, (req, res, next) => {
  let user = new User(req.body);

  bcrypt.hash(user.password, 10, (err, hash) => {
    if (err) {
      return next(err);
    }
    user.password = hash;

    user.save((err, page) => {
      if(err){
        res.json({message: "This email already has an account associated with it."})
        // return next(err);
      }
      res.status(201);
      res.json(formatOutput(user));
    });
  });
});

userRoutes.get('/:userID', mid.authorizeUser, (req, res, next) => {
  res.json(formatOutput(req.user));
});

//update page content
userRoutes.put('/:userID/:userInfo/', mid.authorizeUser, mid.checkUserInput, (req, res, next) => {
  // const input = (req.params.userInfo === "credit") ? CryptoJS.AES.encrypt(req.newOutput, req.user.userID) : req.newOutput;
  req.user[req.params.userInfo] = req.newOutput;

  // const userID = req.user.userID
  // req.user.userID = userID;

  req.user.save((err,user) => {
    if(err) return next(err);
    res.status(200);
    res.json(formatOutput(user));
  });
})

module.exports = userRoutes;
