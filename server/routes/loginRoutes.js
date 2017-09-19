const express = require("express");
const loginRoutes = express.Router();
const mid = require('../middleware/middleware');
const formatOutput = require('../middleware/userOutput').formatOutput;

const configure = require('../configure/config');
const Page = require("../models/page").Page;
const User = require("../models/page").User;


//admin/user login
loginRoutes.post('/', mid.checkLoginInput, (req, res, next) => {
  if(req.body.admin){
    Page.authenticate(req.body.username, req.body.password, (err, user) => {
      if(err){
        res.json({message: err});
      }
      else {
        req.page = user;
        next();
      }
    });
  }
  else {
    User.authenticate(req.body.username, req.body.password, (err, user) => {
      if(err){
        res.json({message: err});
      }
      else {
        req.user = user;
        next();
      }
    });
  }
}, formatOutput);



module.exports = loginRoutes;
