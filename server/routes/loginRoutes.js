const express = require("express");
const loginRoutes = express.Router();
const mid = require('../middleware/middleware');

const configure = require('../configure/config');
const initialEdit = require('../../data/data').initialEdit;
const Page = require("../models/page").Page;
const jwt = require('jsonwebtoken');

//================LOGIN==================================
//admin login
loginRoutes.post('/', mid.checkLoginInput, (req, res, next) => {
  Page.authenticate(req.body.username, req.body.password, (err, user) => {
    if(err){
      res.json({message: err});
    }
    else {
      const token = jwt.sign({userID: user.userID}, configure.secret, {
        expiresIn: '1d' //expires in one day
      });

      res.status(200);
      res.json({user: {token: token}, edit: initialEdit});
    }
  });
});



module.exports = loginRoutes;
