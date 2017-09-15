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

  const user = Object.keys(initialUser).reduce((user, k) => {
    if(k === 'token') user.token = jwt.sign({userID: obj.userID}, configure.secret, { expiresIn: '3h' });
    else if(k === '_id' && obj.admin) user._id = '';
    else if(obj[k]) user[k] = obj[k];
    else user[k] = initialUser[k];
    return user;
  }, {});

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
        //user._id = '';
        user.admin = true;
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
        user.admin = false;
        res.json(formatOutput(user));
      }
    });
  }
});



module.exports = loginRoutes;
