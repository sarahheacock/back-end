const express = require("express");
const authRoutes = express.Router();

const configure = require('../configure/config');
// const initialEdit = require('../../data/data').initialEdit;
const initialUser = require('../../data/data').initial.user;
// const initialMessage = require('../../data/data').initialMessage;
const User = require("../models/page").User;
const jwt = require('jsonwebtoken');

const passport = require('passport');
const FacebookStrategy = require('passport-facebook').Strategy;

//user id is used to retrieve user in deserializeUser
passport.serializeUser((user, next) => {
  next(null, user.id);
});

passport.deserializeUser((obj, next) => {
  next(null, obj);
});

passport.use(new FacebookStrategy({
  clientID: configure.FACEBOOK_APP_ID,
  clientSecret: configure.FACEBOOK_APP_SECRET,
  callbackURL: configure.FACEBOOK_CALLBACKURL,
  profileFields: ['id', 'displayName', 'email'],
  enableProof: true
},
  (token, refreshToken, profile, next) => {
    process.nextTick(() => {

      User.findOne({ $or:[{email: profile._json.email}, {password: profile._json.id}] }).exec((err, user) => {
        if(err){
          return next(err);
        }
        else if(!user){

          const newUser = new User();

          newUser.email = profile._json.email;
          newUser.name = profile._json.name;
          newUser.password = profile._json.id;

          newUser.save((err, user) => {
            if(err){
              err = new Error("Unable to create profile.");
              err.status = 400;
              res.json({message: err.message});
            }
            next(null, user);
          });
        }
        else {
          next(null, user);
        }
      });
    });
}));


//========================================================
authRoutes.use(passport.initialize());
// authRoutes.use(passport.session());


authRoutes.get('/facebook', passport.authenticate('facebook', { scope : ['email'] }));

authRoutes.get('/facebook/callback',
  passport.authenticate('facebook', { session: false, failureRedirect: '/'}),
  (req, res) => {

    const token = jwt.sign({userID: req.user.userID}, configure.secret, {
      expiresIn: '3h' //expires in three hour
    });
    res.redirect('https://sarahbb.herokuapp.com/book/select-room/#register/?token=' + token + '/?id=' + req.user._id);
  });

authRoutes.get('/logout', (req, res) => {
  req.logout();
  res.json({user: initialUser, message: "logged out"})
});




module.exports = authRoutes;
