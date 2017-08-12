const express = require("express");
const userRoutes = express.Router();
const User = require("../models/user").User;
const mid = require('../middleware/middleware');

const configure = require('../configure/config');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const initialUser = require('../../data/data').initialUser;
const initialMessage = require('../../data/data').initialMessage;
const initialEdit = require('../../data/data').initialEdit;


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

// userRoutes.param("userInfo", (req, res, next, id) => {
//   const section = req.user[id];
//   if(!section){
//     err = new Error("User Billing or Credit Not Found");
//     err.status = 404;
//     return next(err);
//   }
//   req.userInfo = section;
//   return next();
// })

//=============================================================
const formatOutput = (obj) => {
  const token = jwt.sign({userID: obj.userID}, configure.secret, {
    expiresIn: '1h' //expires in one hour
  });

  let user = {};
  Object.keys(initialUser).forEach((k) => {
    if(obj[k]) user[k] = obj[k];
    else user[k] = initialUser[k]
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
})


//update page content
userRoutes.put('/:userID/:userInfo/', mid.authorizeUser, mid.checkUserInput, (req, res, next) => {
  console.log(req.newOutput)
  req.user[req.params.userInfo] = req.newOutput;

  req.user.save((err,user) => {
    if(err) return next(err);
    res.status(200);
    res.json(formatOutput(user));
  });
})

module.exports = userRoutes;
