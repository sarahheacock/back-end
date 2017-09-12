const express = require("express");
const loginRoutes = express.Router();
const mid = require('../middleware/middleware');

const configure = require('../configure/config');
const initialEdit = require('../../data/data').initial.edit;
const initialUser = require('../../data/data').initial.user;
const initialMessage = require('../../data/data').initial.message;

const Page = require("../models/page").Page;
const User = require("../models/page").User;
const jwt = require('jsonwebtoken');



//================LOGIN==================================
const formatOutput = (obj) => {
  const token = jwt.sign({userID: obj.userID}, configure.secret, {
    expiresIn: '3h' //expires in three hour
  });

  let user = {};
  Object.keys(initialUser).forEach((k) => {
    if(obj[k]) user[k] = obj[k];
    else user[k] = initialUser[k]
  });
  user.token = token;

  return {user: user, edit: initialEdit, message: initialMessage};
}

//========================================================

//admin/user login
loginRoutes.post('/', mid.checkLoginInput, (req, res, next) => {
  if(req.body.admin){
    Page.authenticate(req.body.username, req.body.password, (err, user) => {
      if(err){
        res.json({message: err});
      }
      else {
        res.status(200);
        user.cart = req.body.cart;
        res.json(formatOutput(user));
      }
    });
  }
  else {
    User.authenticate(req.body.username, req.body.password, (err, user) => {
      if(err){
        res.json({message: err});
      }
      else {
        res.status(200);
        user.cart = req.body.cart;
        res.json(formatOutput(user));
      }
    });
  }
});



module.exports = loginRoutes;
