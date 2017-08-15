const express = require("express");
const loginRoutes = express.Router();
const mid = require('../middleware/middleware');

const configure = require('../configure/config');
const initialEdit = require('../../data/data').initialEdit;
const initialUser = require('../../data/data').initialUser;
const Page = require("../models/page").Page;
const User = require("../models/user").User;
const jwt = require('jsonwebtoken');

const passport = require('passport');
const FacebookStrategy = require('passport-facebook').Strategy;


const fbOptions = {
  clientID: configure.FACEBOOK_APP_ID,
  clientSecret: configure.FACEBOOK_APP_SECRET,
  callbackURL: configure.FACEBOOK_CALLBACKURL,
  profileFields: ['id', 'name', 'email']
};

passport.use(new FacebookStrategy(fbOptions,
  (token, refreshToken, profile, next) => {
  User.findOne({email: profile.email}).exec((err, user) => {
    if(err){
      next(err);
    }
    if(!user){
      const newUser = new User({email: profile.email, name: profile.name, facebookID: profile.id});
      newUser.save((err, user) => {
        if(err){
          err = new Error("Unable to create profile.");
          err.status = 400;
          next(err);
        }
        req.newUser = user;
        next();
      });
    }
    req.newUser = user;
    next();
  })
}));

//================LOGIN==================================
const formatOutput = (obj) => {
  const token = jwt.sign({userID: obj.userID}, configure.secret, {
    expiresIn: '3h' //expires in three hour
  });

  let user = {token: token};
  Object.keys(initialUser).forEach((k) => {
    if(obj[k]) user[k] = obj[k];
    else user[k] = initialUser[k]
  });
  return {user: user, edit: initialEdit, message: initialMessage};
}

//admin login
loginRoutes.post('/', mid.checkLoginInput, (req, res, next) => {
  if(req.body.admin){
    Page.authenticate(req.body.username, req.body.password, (err, user) => {
      if(err){
        res.json({message: err});
      }
      else {
        res.status(200);
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
        res.json(formatOutput(user));
      }
    });
  }
});

loginRoutes.get('/facebook', passport.authenticate('facebook'));

loginRoutes.get('/facebook/callback',
  passport.authenticate('facebook', { failureRedirect: '/gallery' }),
  (req, res) => {
    // Successful authentication, redirect home.
    console.log("yay!")
    res.redirect('/');
    res.status(200);
    console.log(req.newUser);
    res.json(formatUserOutput(req.newUser));
  });



module.exports = loginRoutes;
