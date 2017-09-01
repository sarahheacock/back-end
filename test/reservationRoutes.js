//During the test the env variable is set to test
process.env.NODE_ENV = 'test';

const mongoose = require("mongoose");
const messages = require("../data/data").messages;

const Reservation = require('../server/models/page').Reservation;
const User = require('../server/models/page').User;
const Page = require('../server/models/page').Page;
const Room = require('../server/models/page').Room;

const jwt = require('jsonwebtoken');
const configure = require('../server/configure/config');

//Require the dev-dependencies
const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../server/index');
const should = chai.should();

chai.use(chaiHttp);
//Our parent block

describe('Reservation', () => {
  beforeEach((done) => {
    Page.remove({}, (err) => {
      Reservation.remove({}, (err) => {
        Room.remove({}, (err) => {
          User.remove({}, (err) => { done(); })
        });
      });
    });
  });

  describe('/POST reservation by user', () => {
    let user;
    let token;
    let page;
    let room;

    beforeEach((done) => {
      user = new User({
        name: "Sarah",
        email: "seheacock@bellsouth.net",
        billing: "fghjk",
        credit: "Sarah/5105105105105100/Jan 01/2017/555"
      });

      token = jwt.sign({userID: user.userID}, configure.secret, {
        expiresIn: '1d' //expires in one day
      });

      page = new Page({
        "name": "test",
        "password": "password"
      });
      room = new Room();

      room.save((err, newRoom) => {
        page.gallery.rooms.push(newRoom._id);
        page.save((err, newPage) => {
          user.pageID = newPage._id;
          user.save((err, newUser) => {
            done();
          });
        });
      });

    });

    it("should charge card, post reservation, and send email client when user is signed in", (done) => {
      let start = new Date().getTime();
      let end = start + 24 * 60 * 60 * 1000;

      const reservation = {
        start: start,
        end: end,
        guests: 2,
        roomID: room.id,
        userID: user.id,
        token: token
      };

      chai.request(server)
      .post('/res/user/' + user.id)
      .send(reservation)
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('edit');
        res.body.should.have.property('message').eql(messages.userRes);
        done();
      });
    });
    // it("should return message if card info wrong", (done) => {});
    // it("should return error if dates are invalid", (done) => {});
    // it("should return expiration message and logout if user not signed in", (done) => {});
  });

});
