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
  before((done) => {
    Page.remove({}, (err) => {
      Reservation.remove({}, (err) => {
        Room.remove({}, (err) => {
          User.remove({}, (err) => {
            console.log('DELETE RES BEGIN');
            done();
          });
        });
      });
    });
  });

  describe('Reservation creations', () => {
    let room1;
    let room2;
    let page;
    let user;
    let reservation;

    beforeEach((done) => {
      start = new Date().getTime() + 24 * 60 * 60 * 1000;
      end = start + 24 * 60 * 60 * 1000;
      room1 = new Room({"maximum-occupancy": 3});
      room2 = new Room({"available": 2, "title": "Foo"});
      page = new Page({
        "name": "test",
        "password": "password"
      });
      user = new User({
        email: "seheacock@bellsouth.net",
        name: "Sarah",
        billing: "+16155251915/true"
      })
      reservation = new Reservation({
        start: start + 30 * 24 * 60 * 60 * 1000,
        end: end + 35 * 24 * 60 * 60 * 1000,
        cost: 100,
        guests: 2,
      });

      room1.save((err, roomOne) => {
        room2.save((err, roomTwo) => {
          page.gallery.rooms.push(roomOne._id);
          page.gallery.rooms.push(roomTwo._id);
          page.save((err, newPage) => {
            const item = {
              start: start + 5*24*60*60*1000,
              end: end + 8*24*60*60*1000,
              cost: 100,
              guests: 2,
              roomID: roomTwo._id,
              userID: user.id
            };
            user.cart.push(item);

            user.save((err, newUser) => {
              reservation.roomID = roomOne._id;
              reservation.userID = newUser._id;
              reservation.save((err, newRes) => {
                console.log('CREATE RES');
                done();
              })
            });
          });
        });
      });
    });

    afterEach((done) => {
      Page.remove({}, (err) => {
        Reservation.remove({}, (err) => {
          Room.remove({}, (err) => {
            User.remove({}, (err) => {
              console.log('DELETE RES');
              done();
            })
          });
        });
      });
    });

    describe('/POST get availability from dates and guests when user signed in', () => {
      let userToken;
      let pageToken
      beforeEach(() => {
        userToken = jwt.sign({userID: user.userID}, configure.secret, {
          expiresIn: '1d' //expires in one day
        });
        pageToken = jwt.sign({userID: page.userID}, configure.secret, {
          expiresIn: '1d' //expires in one day
        });
      });

      it('should return availability with no reservations', (done) => {

        chai.request(server)
        .post('/res/available/')
        .send({
          start: start,
          end: end,
          guests: 2,
          roomID: '',
          cost: 0
        })
        .end((err, res) => {
          console.log(res.body);

          res.should.have.status(200);
          res.body.should.be.a('object')
          res.body.book.available.should.be.a('array').length(2);
          //res.body.user.cart.should.be.a('array').length(1);
          done();
        });
      });

      it('should return availability with cart items', (done) => {
        const newStart = user.cart[0]["start"];
        const newEnd = user.cart[0]["end"];

        chai.request(server)
        .post('/res/available/user/' + user.id + "?token=" + userToken)
        .send({
          start: newStart,
          end: newEnd,
          guests: 2,
          roomID: '',
          cost: 0
        })
        .end((err, res) => {
          console.log(res.body, user);
          res.should.have.status(200);
          res.body.should.be.a('object')
          res.body.book.available.should.be.a('array').length(2);
          res.body.book.available[0]['available'].should.eql(1);
          res.body.book.available[1]['available'].should.eql(1);
          res.body.user.cart.should.be.a('array').length(1);
          done();
        });
      });

      it('should return availability with cart start', (done) => {
        const newStart = user.cart[0]["start"] + 24*60*60*1000;
        const newEnd = user.cart[0]["end"] + 24*60*60*1000;

        chai.request(server)
        .post('/res/available/user/' + user.id + "?token=" + userToken)
        .send({
          start: newStart,
          end: newEnd,
          guests: 2,
          roomID: '',
          cost: 0
        })
        .end((err, res) => {
          console.log(res.body);
          res.should.have.status(200);
          res.body.should.be.a('object')
          res.body.book.available.should.be.a('array').length(2);
          res.body.book.available[0]['available'].should.eql(1);
          res.body.book.available[1]['available'].should.eql(1);
          res.body.user.cart.should.be.a('array').length(1);
          done();
        });
      });

      it('should return availability with cart end', (done) => {
        const newStart = user.cart[0]["start"] - 24*60*60*1000;
        const newEnd = user.cart[0]["end"] - 24*60*60*1000;

        chai.request(server)
        .post('/res/available/user/' + user.id + "?token=" + userToken)
        .send({
          start: newStart,
          end: newEnd,
          guests: 2,
          roomID: '',
          cost: 0
        })
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('object')
          res.body.book.available.should.be.a('array').length(2);
          res.body.book.available[0]['available'].should.eql(1);
          res.body.book.available[1]['available'].should.eql(1);
          res.body.user.cart.should.be.a('array').length(1);
          done();
        });
      });

      it('should return availability with large cart', (done) => {
        const newStart = user.cart[0]["start"] - 24*60*60*1000;
        const newEnd = user.cart[0]["end"] + 24*60*60*1000;

        chai.request(server)
        .post('/res/available/user/' + user.id + "?token=" + userToken)
        .send({
          start: newStart,
          end: newEnd,
          guests: 2,
          roomID: '',
          cost: 0
        })
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('object')
          res.body.book.available.should.be.a('array').length(2);
          res.body.book.available[0]['available'].should.eql(1);
          res.body.book.available[1]['available'].should.eql(1);
          res.body.user.cart.should.be.a('array').length(1);
          done();
        });
      });

      it('should return availability with small cart', (done) => {
        const newStart = user.cart[0]["start"] + 24*60*60*1000;
        const newEnd = user.cart[0]["end"] - 24*60*60*1000;

        chai.request(server)
        .post('/res/available/user/' + user.id + "?token=" + userToken)
        .send({
          start: newStart,
          end: newEnd,
          guests: 2,
          roomID: '',
          cost: 0
        })
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('object')
          res.body.book.available.should.be.a('array').length(2);
          res.body.book.available[0]['available'].should.eql(1);
          res.body.book.available[1]['available'].should.eql(1);
          res.body.user.cart.should.be.a('array').length(1);
          done();
        });
      });

      it('should return availability with cart items', (done) => {
        const newStart = user.cart[0]["start"];
        const newEnd = user.cart[0]["end"];

        chai.request(server)
        .post('/res/available/user/' + user.id + "?token=" + userToken)
        .send({
          start: newStart,
          end: newEnd,
          guests: 2,
          roomID: '',
          cost: 0
        })
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('object')
          res.body.book.available.should.be.a('array').length(2);
          res.body.book.available[0]['available'].should.eql(1);
          res.body.book.available[1]['available'].should.eql(1);
          res.body.user.cart.should.be.a('array').length(1);
          done();
        });
      });

      it('should reverse dates if dateOne is greater than dateTwo', (done) => {
        const checkStart = new Date(parseInt(start)).setUTCHours(12, 0, 0, 0);

        chai.request(server)
        .post('/res/available/')
        .send({
          start: start,
          end: end,
          guests: 2,
          roomID: '',
          cost: 0
        })
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('object')
          res.body.book.available.should.be.a('array').length(2);
          res.body.book.reservation.start.should.eql(checkStart);
          //res.body.user.cart.should.be.a('array').length(1);
          done();
        });
      });

      it('should return availability with guest request less', (done) => {
        chai.request(server)
        .post('/res/available/user/' + user.id + "?token=" + userToken)
        .send({
          start: start,
          end: end,
          guests: 1,
          roomID: '',
          cost: 0
        })
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('object')
          res.body.book.available.should.be.a('array').length(2);
          res.body.user.cart.should.be.a('array').length(1);
          done();
        });
      });

      it('should return availability with large guest request', (done) => {
        let newEnd = end + (24*60*60*1000);

        chai.request(server)
        .post('/res/available/user/' + user.id + "?token=" + userToken)
        .send({
          start: start,
          end: newEnd,
          guests: 3,
          roomID: '',
          cost: 0
        })
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('object')
          res.body.book.available.should.be.a('array').length(1);
          res.body.book.available[0]["title"].should.equal(room1.title);
          res.body.book.available[0]["cost"].should.equal(room1.cost * 2);
          res.body.user.cart.should.be.a('array').length(1);
          res.body.user.name.should.equal(user.name);
          done();
        });
      });

      it('should not matter if leaving when coming', (done) => {
        let newEnd = reservation.start;
        let newStart = reservation.start - (24*60*60*1000);

        chai.request(server)
        .post('/res/available/user/' + user.id + "?token=" + userToken)
        .send({
          start: newStart,
          end: newEnd,
          guests: 2,
          roomID: '',
          cost: 0
        })
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('object')
          res.body.book.available.should.be.a('array').length(2);
          res.body.user.cart.should.be.a('array').length(1);
          // res.body.book.available[0]["title"].should.equal(room2.title);
          done();
        });
      });

      it('should not change if coming when leaving', (done) => {
        let newEnd = reservation.end + (24*60*60*1000);
        let newStart = reservation.end;

        chai.request(server)
        .post('/res/available/user/' + user.id + "?token=" + userToken)
        .send({
          start: newStart,
          end: newEnd,
          guests: 2,
          roomID: '',
          cost: 0
        })
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('object')
          res.body.book.available.should.be.a('array').length(2);
          res.body.user.cart.should.be.a('array').length(1);
          done();
        });
      });

      it('should not return if start is within a reservation', (done) => {
        let newEnd = reservation.end + 24*60*60*1000;

        chai.request(server)
        .post('/res/available/user/' + user.id + "?token=" + userToken)
        .send({
          start: reservation.start,
          end: newEnd,
          guests: 2,
          roomID: '',
          cost: 0
        })
        .end((err, res) => {
          console.log(res.body);
          res.should.have.status(200);
          res.body.should.be.a('object')
          res.body.book.available.should.be.a('array').length(1);
          res.body.user.cart.should.be.a('array').length(1);
          done();
        });
      });

      it('should not return if end is within a reservation', (done) => {
        let newStart = reservation.start - 24*60*60*1000;

        chai.request(server)
        .post('/res/available/user/' + user.id + "?token=" + userToken)
        .send({
          start: newStart,
          end: reservation.end,
          guests: 2,
          roomID: '',
          cost: 0
        })
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('object')
          res.body.book.available.should.be.a('array').length(1);
          res.body.user.cart.should.be.a('array').length(1);
          done();
        });
      });

      it('should not return if reservation if reservation outside', (done) => {
        let newEnd = reservation.end + 24*60*60*1000;
        let newStart = reservation.end - 24*60*60*1000;

        chai.request(server)
        .post('/res/available/user/' + user.id + "?token=" + userToken)
        .send({
          start: newStart,
          end: newEnd,
          guests: 2,
          roomID: '',
          cost: 0
        })
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('object')
          res.body.book.available.should.be.a('array').length(1);
          res.body.user.cart.should.be.a('array').length(1);
          done();
        });
      });

      it('should not return if reservation inside', (done) => {
        let newEnd = reservation.end - 24*60*60*1000;
        let newStart = reservation.end + 24*60*60*1000;

        chai.request(server)
        .post('/res/available/user/' + user.id + "?token=" + userToken)
        .send({
          start: newStart,
          end: newEnd,
          guests: 2,
          roomID: '',
          cost: 0
        })
        .end((err, res) => {
          console.log(res.body);
          res.should.have.status(200);
          res.body.should.be.a('object')
          res.body.book.available.should.be.a('array').length(1);
          res.body.user.cart.should.be.a('array').length(1);
          done();
        });
      });

      it('should not return room if reserved and guest request too high', (done) => {
        chai.request(server)
        .post('/res/available/user/' + user.id + "?token=" + userToken)
        .send({
          start: reservation.start,
          end: reservation.end,
          guests: 3,
          roomID: '',
          cost: 0
        })
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('object')
          res.body.book.available.should.be.a('array').length(0);
          res.body.user.cart.should.be.a('array').length(1);
          done();
        });
      });

      it('should not return room if reserved and guest request too high with admin', (done) => {
        chai.request(server)
        .post('/res/available/page/' + page.id + "/" + user.id + "?token=" + pageToken)
        .send({
          start: reservation.start,
          end: reservation.end,
          guests: 3,
          roomID: '',
          cost: 0
        })
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('object')
          res.body.book.available.should.be.a('array').length(0);
          res.body.user.cart.should.be.a('array').length(1);
          done();
        });
      });

      it('should not return room if reserved and guest request too high with admin and without user', (done) => {
        chai.request(server)
        .post('/res/available/page/' + page.id + "?token=" + pageToken)
        .send({
          start: reservation.start,
          end: reservation.end,
          guests: 3,
          roomID: '',
          cost: 0
        })
        .end((err, res) => {
          console.log(res.body.user.cart);
          res.should.have.status(200);
          res.body.should.be.a('object')
          res.body.book.available.should.be.a('array').length(0);
          res.body.user.cart.should.be.a('array').length(0);
          done();
        });
      });

      it('should remove cart item and send message if no longer available', (done) => {
        let newRes = new Reservation({
          start: start + 5*24*60*60*1000,
          end: end + 8*24*60*60*1000,
          cost: 100,
          guests: 2,
          roomID: room2.id,
          userID: user.id
        });
        let newNewRes = new Reservation({
          start: start + 5*24*60*60*1000,
          end: end + 7*24*60*60*1000,
          cost: 100,
          guests: 2,
          roomID: room2.id,
          userID: user.id
        });

        newRes.save((err, doc) => {
          newNewRes.save((err, newDoc) => {
            chai.request(server)
            .post('/res/available/user/' + user.id + "?token=" + userToken)
            .send({
              start: start + 5*24*60*60*1000,
              end: end + 6*24*60*60*1000,
              guests: 2,
              roomID: '',
              cost: 0
            })
            .end((err, res) => {
              res.should.have.status(200);
              res.body.should.be.a('object')
              res.body.book.available.should.be.a('array').length(1);
              res.body.user.cart.should.be.a('array').length(0);
              res.body.message.should.eql(messages.available);
              done();
            });
          });
        });
      });
    });

    describe('/POST add cart item and get availability', () => {
      let userToken;
      let pageToken
      beforeEach(() => {
        userToken = jwt.sign({userID: user.userID}, configure.secret, {
          expiresIn: '1d' //expires in one day
        });
        pageToken = jwt.sign({userID: page.userID}, configure.secret, {
          expiresIn: '1d' //expires in one day
        });
      });

      it("should return larger cart if user defined", (done) => {
        chai.request(server)
        .post('/res/available/user/' + user.id + "?token=" + userToken)
        .send({
          start: start + 5*24*60*60*1000,
          end: end + 8*24*60*60*1000,
          cost: 100,
          guests: 2,
          roomID: room2.id,
          userID: user.id
        })
        .end((err, res) => {
          res.body.should.be.a('object');
          res.body.book.available.should.be.a('array').length(1);
          res.body.user.cart.should.be.a('array').length(2);
          res.body.user.name.should.eql(user.name);
          done();
        });
      });

      it("should return larger cart if user and page defined", (done) => {
        chai.request(server)
        .post('/res/available/page/' + page.id + "/" + user.id + "?token=" + pageToken)
        .send({
          start: start + 300*24*60*60*1000,
          end: end + 305*24*60*60*1000,
          cost: 100,
          guests: 2,
          roomID: room2.id,
          userID: user.id
        })
        .end((err, res) => {
          console.log(res.body);
          res.body.should.be.a('object');
          res.body.book.available.should.be.a('array').length(2);
          res.body.user.cart.should.be.a('array').length(2);
          res.body.book.available[0]["available"].should.eql(1);
          res.body.book.available[1]["available"].should.eql(1);
          res.body.user.name.should.eql(page.name);
          done();
        });
      });

      it("should return message if new cart item not available", (done) => {
        let newRes = new Reservation({
          start: start + 5*24*60*60*1000,
          end: end + 8*24*60*60*1000,
          cost: 100,
          guests: 2,
          roomID: room1.id,
          userID: user.id
        });

        newRes.save((err, doc) => {
          chai.request(server)
          .post('/res/available/page/' + page.id + "/" + user.id + "?token=" + pageToken)
          .send({
            start: start + 2*24*60*60*1000,
            end: end + 6*24*60*60*1000,
            cost: 100,
            guests: 2,
            roomID: room1.id,
            userID: user.id
          })
          .end((err, res) => {
            console.log(res.body);
            res.body.should.be.a('object');
            res.body.book.available.should.be.a('array').length(1);
            res.body.user.cart.should.be.a('array').length(1);
            res.body.book.available[0]["available"].should.eql(1);
            res.body.user.name.should.eql(page.name);
            res.body.message.should.eql(messages.available);
            done();
          });
        });
      });

      it("should return login modal user undefined and page undefined", (done) => {
        chai.request(server)
        .post('/res/available/')
        .send({
          start: start + 2*24*60*60*1000,
          end: end + 6*24*60*60*1000,
          cost: 100,
          guests: 2,
          roomID: room1.id,
          userID: user.id
        })
        .end((err, res) => {
          console.log(res.body);
          res.body.should.be.a('object');
          res.body.edit.url.should.eql('/login');
          done();
        });
      });

      it("should return email modal if page defined but user undefined", (done) => {
        chai.request(server)
        .post('/res/available/page/' + page.id + '?token=' + pageToken)
        .send({
          start: start + 2*24*60*60*1000,
          end: end + 6*24*60*60*1000,
          cost: 100,
          guests: 2,
          roomID: room1.id,
          userID: user.id
        })
        .end((err, res) => {
          console.log(res.body);
          res.body.should.be.a('object');
          res.body.user.name.should.eql(page.name);
          done();
        });
      });
    });

    describe('/POST reservations by user', () => {
      let token;
      beforeEach(() => {
        token = jwt.sign({userID: user.userID}, configure.secret, {
          expiresIn: '1d' //expires in one day
        });
      });

      it('should book cart reservations if they are available', (done) => {
        chai.request(server)
        .post('/res/user/' + user.id + "?token=" + token)
        .send({message: "hi"})
        .end((err, res) => {
          console.log(res.body);
          res.body.message.should.eql("hi");
          done();
        });
      });

      it('should post confirmation even if email does not send', (done) => {
        user.email = "sarah@gmail.com";
        user.save((err, doc) => {
          chai.request(server)
          .post('/res/user/' + user.id + "?token=" + token)
          .send({message: "hi"})
          .end((err, res) => {
            res.body.message.should.eql("hi");
            done();
          });
        });
      })

      it('should post confirmation even if text does not send', (done) => {
        user.billing = "+55555/true";
        user.save((err, doc) => {
          chai.request(server)
          .post('/res/user/' + user.id + "?token=" + token)
          .send({message: "hi"})
          .end((err, res) => {
            res.body.message.should.eql("hi");
            done();
          });
        });
      })

      it('should post confirmation even if text does not send by choice', (done) => {
        user.billing = "+16155251915/false";
        user.save((err, doc) => {
          chai.request(server)
          .post('/res/user/' + user.id + "?token=" + token)
          .send({message: "hi"})
          .end((err, res) => {
            res.body.message.should.eql("hi");
            done();
          });
        });
      })

      it('should halt all reservations if one cart item is not available', (done) => {
        let newRes = new Reservation({
          start: start + 5*24*60*60*1000,
          end: end + 8*24*60*60*1000,
          cost: 100,
          guests: 2,
          roomID: room2.id,
          userID: user.id
        });
        let newNewRes = new Reservation({
          start: start + 5*24*60*60*1000,
          end: end + 8*24*60*60*1000,
          cost: 100,
          guests: 2,
          roomID: room2.id,
          userID: user.id
        });

        newRes.save((err, doc) => {
          newNewRes.save((err, newDoc) => {
            chai.request(server)
            .post('/res/user/' + user.id + "?token=" + token)
            .send({message: "hi"})
            .end((err, res) => {
              console.log(res.body);
              res.body.user.cart.should.be.a('array').length(0);
              res.body.message.should.eql(messages.confirmError);
              done();
            });
          });
        });
      });
    });

    describe('/POST reservations by admin', () => {
      let token;
      beforeEach(() => {
        token = jwt.sign({userID: page.userID}, configure.secret, {
          expiresIn: '1d' //expires in one day
        });
      });

      it('should book cart reservations if they are available', (done) => {
        chai.request(server)
        .post('/res/page/' + page.id + "/" + user.id + "?token=" + token)
        .send({message: "hi"})
        .end((err, res) => {
          res.body.message.should.eql("hi");
          done();
        });
      });

      it('should halt all reservations if one cart item is not available', (done) => {
        let newRes = new Reservation({
          start: start + 5*24*60*60*1000,
          end: end + 8*24*60*60*1000,
          cost: 100,
          guests: 2,
          roomID: room2.id,
          userID: user.id
        });

        let newNewRes = new Reservation({
          start: start + 5*24*60*60*1000,
          end: end + 8*24*60*60*1000,
          cost: 100,
          guests: 2,
          roomID: room2.id,
          userID: user.id
        });

        newRes.save((err, doc) => {
          newNewRes.save((err, newDoc) => {
            chai.request(server)
            .post('/res/page/' + page.id + "/" + user.id + "?token=" + token)
            .send({})
            .end((err, res) => {
              console.log(res.body);
              res.body.user.cart.should.be.a('array').length(0);
              res.body.message.should.eql(messages.confirmError);
              done();
            });
          });
        });
      });
    });

    describe('/GET reservation by user', () => {
      let token;
      beforeEach(() => {
        token = jwt.sign({userID: user.userID}, configure.secret, {
          expiresIn: '1d' //expires in one day
        });
      });

      it("should return user's reservations", (done) => {
        chai.request(server)
        .get('/res/user/' + user.id + "?token=" + token)
        .end((err, res) => {
          res.body.should.be.a('object');
          res.body.should.have.property('welcome');
          res.body.welcome.should.be.a('array').length(1);
          res.body.welcome[0]["roomID"]["title"].should.eql("Title");
          done();
        });
      });

      it("should return empty array if no reservations", (done) => {
        let newUser = new User({
          email: "adam@gmail.com"
        });
        newUser.save((err, doc) => {
          const newToken = jwt.sign({userID: doc.userID}, configure.secret, {
            expiresIn: '1d' //expires in one day
          });

          chai.request(server)
          .get('/res/user/' + doc._id + "?token=" + newToken)
          .end((err, res) => {
            res.should.have.status(200);
            res.body.should.be.a('object');
            res.body.should.have.property('welcome');
            res.body.welcome.should.be.a('array').length(0);
            done();
          });
        });
      });

      it("should return expiration message and logout if user not signed in to get reservations", (done) => {
        chai.request(server)
        .get('/res/user/' + user.id + "?token=fghjk")
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.have.property('message').eql(messages.expError);
          done();
        });
      });
    });

    describe('/PUT reservation by admin', () => {
      let token;
      beforeEach(() => {
        token = jwt.sign({userID: page.userID}, configure.secret, {
          expiresIn: '1d' //expires in one day
        });
      });

      it('should check in client', (done) => {
        chai.request(server)
        .put('/res/page/' + page.id + "/checkIn/" + user.id + "?token=" + token)
        .send({reservations: [reservation]})
        .end((err, res) => {
          console.log(res.body);
          res.body.message.should.eql('');
          res.body.welcome[0]["checkedIn"].should.eql(true);
          done();
        });
      });

      it('should remind client', (done) => {
        chai.request(server)
        .put('/res/page/' + page.id + "/reminder/" + user.id + "?token=" + token)
        .send({reservations: [reservation]})
        .end((err, res) => {
          console.log(res.body);
          res.body.message.should.eql('');
          res.body.welcome[0]["reminded"].should.eql(true);
          done();
        });
      });

      it('should remind both', (done) => {
        let newRes = new Reservation({
          start: start + 5*24*60*60*1000,
          end: end + 8*24*60*60*1000,
          cost: 100,
          guests: 2,
          roomID: room2.id,
          userID: user.id
        });
        newRes.save((err, r) => {
          console.log(r);
          chai.request(server)
          .put('/res/page/' + page.id + "/checkIn/" + user.id + "?token=" + token)
          .send({reservations: [reservation, r]})
          .end((err, res) => {
            console.log(res.body);
            res.body.welcome[0]["checkedIn"].should.eql(true);
            res.body.welcome[1]["checkedIn"].should.eql(true);
            done();
          });
        });
      });

      it('should remind one', (done) => {
        let newRes = new Reservation({
          start: start + 5*24*60*60*1000,
          end: end + 8*24*60*60*1000,
          cost: 100,
          guests: 2,
          roomID: room2.id,
          userID: user.id
        });
        newRes.save((r) => {
          chai.request(server)
          .put('/res/page/' + page.id + "/checkIn/" + user.id + "?token=" + token)
          .send({reservations: [reservation]})
          .end((err, res) => {
            console.log(res.body);
            res.body.welcome[0]["checkedIn"].should.eql(true);
            done();
          });
        });
      });

      it('should send error message if email wrong', (done) => {
        user.email = "sarah@gmail.com";
        user.save((err, doc) => {
          chai.request(server)
          .put('/res/page/' + page.id + "/checkIn/" + user.id + "?token=" + token)
          .send({reservations: [reservation]})
          .end((err, res) => {
            console.log(res.body);
            res.body.message.should.eql(messages.emailError);
            res.body.welcome[0]["checkedIn"].should.eql(false);
            done();
          });
        });
      });

      it('should send error message and not remind if email wrong', (done) => {
        user.email = "sarah@gmail.com";
        user.save((err, doc) => {
          chai.request(server)
          .put('/res/page/' + page.id + "/checkIn/" + user.id + "?token=" + token)
          .send({reservations: [reservation]})
          .end((err, res) => {
            console.log(res.body);
            res.body.message.should.eql(messages.emailError);
            res.body.welcome[0]["reminded"].should.eql(false);
            done();
          });
        });
      });

      it('should send error message if phone wrong', (done) => {
        user.billing = "+456789/true";
        user.save((err, doc) => {
          chai.request(server)
          .put('/res/page/' + page.id + "/checkIn/" + user.id + "?token=" + token)
          .send({reservations: [reservation]})
          .end((err, res) => {
            console.log(res.body);
            res.body.message.should.eql(messages.phoneError);
            res.body.welcome[0]["checkedIn"].should.eql(true);
            done();
          });
        });
      });

      it('should send error if both are wrong', (done) => {
        user.email = "sarah@gmail.com";
        user.billing = "+456789/true";

        user.save((err, doc) => {
          chai.request(server)
          .put('/res/page/' + page.id + "/checkIn/" + user.id + "?token=" + token)
          .send({reservations: [reservation]})
          .end((err, res) => {
            res.body.message.should.eql(messages.emailError + " " + messages.phoneError);
            res.body.welcome[0]["checkedIn"].should.eql(false);
            done();
          });
        });
      });
    });

    // describe('/DELETE cart item', () => {
    //   let token;
    //   beforeEach(() => {
    //     token = jwt.sign({userID: user.userID}, configure.secret, {
    //       expiresIn: '1d' //expires in one day
    //     });
    //   });
    //
    //   it('should delete cart item and update availability', (done) => {
    //
    //   });
    // });

    describe('/DELETE reservation', () => {
      let token;
      beforeEach(() => {
        token = jwt.sign({userID: page.userID}, configure.secret, {
          expiresIn: '1d' //expires in one day
        });
      });

      it('should delete reservation and return calendar', (done) => {
        chai.request(server)
        .delete('/res/page/' + page.id + "/cancel/" + user.id + "?token=" + token)
        .send({reservations: [reservation]})
        .end((err, res) => {
          console.log(res.body);
          res.body.message.should.eql('');
          res.body.welcome.should.be.a('array').length(0);
          done();
        });
      });
    });


  });
});
