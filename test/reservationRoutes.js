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

  describe('/GET availability from dates and guests', () => {
    let room1;
    let room2;
    let page;
    let start = new Date().getTime();
    let end = start + 24 * 60 * 60 * 1000;

    beforeEach((done) => {
      room1 = new Room({"maximum-occupancy": 3});
      room2 = new Room({"available": 2, "title": "Foo"});
      page = new Page({
        "name": "test",
        "password": "password"
      });

      room1.save((err, roomOne) => {
        room2.save((err, roomTwo) => {
          page.gallery.rooms.push(roomOne._id);
          page.gallery.rooms.push(roomTwo._id);
          page.save((err, newPage) => { done(); });
        });
      });
    });

    it('should return availability with no reservations', (done) => {
      chai.request(server)
      .get('/res/available/' + start + '/' + end + '/2')
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a('array').length(2);
        done();
      });
    });

    it('should return availability with guest request less', (done) => {
      chai.request(server)
      .get('/res/available/' + start + '/' + end + '/1')
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a('array').length(2);
        done();
      });
    });

    it('should return availability with large guest request', (done) => {
      let newEnd = end + (24*60*60*1000);

      chai.request(server)
      .get('/res/available/' + start + '/' + newEnd + '/3')
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a('array').length(1);
        res.body[0]["title"].should.equal(room1.title);
        done();
      });
    });

    it('should not return room if reserved', (done) => {
      const reservation = new Reservation({
        start: start,
        end: end,
        cost: 100,
        guests: 2,
        roomID: room1.id
      });
      reservation.save((err, doc) => {
        let newEnd = end - (24*60*60*1000);
        let newStart = end - (24*60*60*1000);
        chai.request(server)
        .get('/res/available/' + newStart + '/' + newEnd + '/2')
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('array').length(1);
          res.body[0]["title"].should.equal(room2.title);
          done();
        });
      });
    });

    it('should not return room if reserved and guest request too high', (done) => {
      const reservation = new Reservation({
        start: start,
        end: end,
        cost: 100,
        guests: 2,
        roomID: room1.id
      });
      reservation.save((err, doc) => {
        chai.request(server)
        .get('/res/available/' + start + '/' + end + '/3')
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('array').length(0);
          done();
        });
      });
    });

    it('should still return room if another is available', (done) => {
      const reservation = new Reservation({
        start: start,
        end: end,
        cost: 100,
        guests: 2,
        roomID: room2.id
      });
      reservation.save((err, doc) => {
        chai.request(server)
        .get('/res/available/' + start + '/' + end + '/2')
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('array').length(2);
          done();
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
            token = jwt.sign({userID: user.userID}, configure.secret, {
              expiresIn: '1d' //expires in one day
            });
            done();
          });
        });
      });

    });

    it("should post reservation, and send email client when user is signed in", (done) => {
      let start = new Date().getTime();
      let end = start + 24 * 60 * 60 * 1000;

      const reservation = {
        start: start,
        end: end,
        guests: 2,
        roomID: room.id,
        cost: 100,
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
