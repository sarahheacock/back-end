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
        name: "Sarah"
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
        .post('/res/available/' + user.id + "?token=" + userToken)
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

      it('should return availability with cart start', (done) => {
        const newStart = user.cart[0]["start"] + 24*60*60*1000;
        const newEnd = user.cart[0]["end"] + 24*60*60*1000;

        chai.request(server)
        .post('/res/available/' + user.id + "?token=" + userToken)
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

      it('should return availability with cart end', (done) => {
        const newStart = user.cart[0]["start"] - 24*60*60*1000;
        const newEnd = user.cart[0]["end"] - 24*60*60*1000;

        chai.request(server)
        .post('/res/available/' + user.id + "?token=" + userToken)
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
        .post('/res/available/' + user.id + "?token=" + userToken)
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
        .post('/res/available/' + user.id + "?token=" + userToken)
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
        .post('/res/available/' + user.id + "?token=" + userToken)
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
        .post('/res/available/' + user.id + "?token=" + userToken)
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
        .post('/res/available/' + user.id + "?token=" + userToken)
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
        .post('/res/available/' + user.id + "?token=" + userToken)
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
        .post('/res/available/' + user.id + "?token=" + userToken)
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
        .post('/res/available/' + user.id + "?token=" + userToken)
        .send({
          start: reservation.start,
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

      it('should not return if end is within a reservation', (done) => {
        let newStart = reservation.start - 24*60*60*1000;

        chai.request(server)
        .post('/res/available/' + user.id + "?token=" + userToken)
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
        .post('/res/available/' + user.id + "?token=" + userToken)
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
        .post('/res/available/' + user.id + "?token=" + userToken)
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

      it('should not return room if reserved and guest request too high', (done) => {
        chai.request(server)
        .post('/res/available/' + user.id + "?token=" + userToken)
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
        .post('/res/available/' + user.id + "/" + page.id + "?token=" + pageToken)
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
        .post('/res/available/undefined/' + page.id + "?token=" + pageToken)
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
            .post('/res/available/' + user.id + "?token=" + userToken)
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
        .post('/res/available/' + user.id + "?token=" + userToken)
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
        .post('/res/available/' + user.id + "/" + page.id + "?token=" + pageToken)
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
          .post('/res/available/' + user.id + "/" + page.id + "?token=" + pageToken)
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
        .post('/res/available/undefined/' + page.id + '?token=' + pageToken)
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
        .send({})
        .end((err, res) => {
          console.log(res.body);
          res.body.user.cart.should.be.a('array').length(0);
          res.body.user.name.should.eql(user.name);
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
            .post('/res/user/' + user.id + "?token=" + token)
            .send({})
            .end((err, res) => {
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


  });
});




  // describe('/POST reservation by user', () => {
  //   let user;
  //   let token;
  //   let page;
  //   let room;
  //
  //   beforeEach((done) => {
  //     user = new User({
  //       name: "Sarah",
  //       email: "seheacock@bellsouth.net",
  //       billing: "fghjk",
  //       credit: "Sarah/5105105105105100/Jan 01/2017/555"
  //     });
  //
  //     page = new Page({
  //       "name": "test",
  //       "password": "password"
  //     });
  //     room = new Room();
  //
  //     room.save((err, newRoom) => {
  //       page.gallery.rooms.push(newRoom._id);
  //       page.save((err, newPage) => {
  //         user.pageID = newPage._id;
  //         user.save((err, newUser) => {
  //           token = jwt.sign({userID: newUser.userID}, configure.secret, {
  //             expiresIn: '1d' //expires in one day
  //           });
  //           done();
  //         });
  //       });
  //     });
  //   });
  //
  //   it("should post reservation, and send email client when user is signed in", (done) => {
  //     let start = new Date().getTime();
  //     let end = start + 24 * 60 * 60 * 1000;
  //
  //     const myRes = {
  //       book: {
  //         reservation: {
  //           start: start,
  //           end: end,
  //           guests: 2,
  //           roomID: room.id,
  //           cost: 100
  //         },
  //         available: []
  //       }
  //     };
  //
  //     chai.request(server)
  //     .post('/res/user/' + user.id + "?token=" + token)
  //     .send(myRes)
  //     .end((err, res) => {
  //       res.should.have.status(200);
  //       res.body.should.be.a('object');
  //       res.body.should.have.property('book');
  //       res.body.should.have.property('message').eql(messages.userRes);
  //       done();
  //     });
  //   });
  //
  //   it("should return no longer available if another res made", (done) => {
  //     let start = new Date().getTime();
  //     let end = start + 24 * 60 * 60 * 1000;
  //
  //     const myRes = {
  //       book: {
  //         reservation: {
  //           start: start,
  //           end: end,
  //           guests: 2,
  //           roomID: room.id,
  //           cost: 100,
  //           userID: user.id
  //         },
  //         available: []
  //       }
  //     };
  //
  //     const reservation = new Reservation(myRes.book.reservation);
  //     reservation.save((err, doc) => {
  //       chai.request(server)
  //       .post('/res/user/' + user.id + "?token=" + token)
  //       .send(myRes)
  //       .end((err, res) => {
  //         res.body.should.be.a('object');
  //         res.body.should.have.property('message').eql(messages.available);
  //         done();
  //       });
  //     });
  //   });
  //
  //   it("should return expiration message and logout if user not signed in", (done) => {
  //     let start = new Date().getTime();
  //     let end = start + 24 * 60 * 60 * 1000;
  //     const reservation = {
  //       book: {
  //         reservation: {
  //           start: start,
  //           end: end,
  //           guests: 2,
  //           roomID: room.id,
  //           cost: 100
  //         },
  //         available: []
  //       }
  //     };
  //
  //     chai.request(server)
  //     .post('/res/user/' + user.id + "?token=ghjkl")
  //     .send(reservation)
  //     .end((err, res) => {
  //       res.should.have.status(200);
  //       res.body.should.have.property('message').eql(messages.expError);
  //       done();
  //     });
  //   });
  // });
  //
  // describe('/POST reservation by admin', () => {
  //   let token;
  //   let page;
  //   let room;
  //   let user;
  //
  //   beforeEach((done) => {
  //     page = new Page({
  //       "name": "test",
  //       "password": "password"
  //     });
  //
  //     room = new Room({available: 2});
  //     user = new User({
  //       name: "Sarah",
  //       email: "seheacock@bellsouth.net",
  //       billing: "fghjk",
  //       credit: "Sarah/5105105105105100/Jan 01/2017/555"
  //     });
  //
  //     room.save((err, newRoom) => {
  //       page.gallery.rooms.push(newRoom._id);
  //       page.save((err, newPage) => {
  //         token = jwt.sign({userID: newPage.userID}, configure.secret, {
  //           expiresIn: '1d' //expires in one day
  //         });
  //         user.save((err, newUser))
  //         done();
  //       });
  //     });
  //   });
  //
  //   it("should create a new reservation new user", (done) => {
  //     let start = new Date().getTime();
  //     let end = start + 24 * 60 * 60 * 1000;
  //     const input = {
  //       user: {
  //         token: token,
  //         name: "Sarah",
  //         email: "seheacock@bellsouth.net",
  //         billing: "fghjk",
  //         credit: "Sarah/5105105105105100/Jan 01/2017/555",
  //         cart: [{
  //           start: start,
  //           end: end,
  //           guests: 2,
  //           roomID: room.id,
  //           cost: 100
  //         }]
  //       }
  //     };
  //
  //     chai.request(server)
  //     .post('/res/page/' + page.id + "?token=" + token)
  //     .send(input)
  //     .end((err, res) => {
  //       console.log(res.body);
  //       res.should.have.status(200);
  //       res.body.should.have.property('book');
  //       res.body.should.have.property('message').eql(messages.userRes);
  //       res.body.user.should.have.property('token').eql(token);
  //       res.body.user.should.have.property('email').eql('');
  //       done();
  //     });
  //   });
  //
  //   it("should create multiple reservations with new user", (done) => {
  //     let start = new Date().getTime();
  //     let end = start + 24 * 60 * 60 * 1000;
  //     const input = {
  //       user: {
  //         token: token,
  //         name: "Sarah",
  //         email: "seheacock@bellsouth.net",
  //         billing: "fghjk",
  //         credit: "Sarah/5105105105105100/Jan 01/2017/555",
  //         cart: [{
  //           start: start,
  //           end: end,
  //           guests: 2,
  //           roomID: room.id,
  //           cost: 100
  //         },
  //         {
  //           start: start,
  //           end: end,
  //           guests: 2,
  //           roomID: room.id,
  //           cost: 100
  //         }]
  //       }
  //     };
  //
  //     chai.request(server)
  //     .post('/res/page/' + page.id + "?token=" + token)
  //     .send(input)
  //     .end((err, res) => {
  //       console.log(res.body);
  //       res.should.have.status(200);
  //       res.body.should.have.property('book');
  //       res.body.should.have.property('message').eql(messages.userRes);
  //       res.body.user.should.have.property('token').eql(token);
  //       res.body.user.should.have.property('email').eql('');
  //       done();
  //     });
  //   });
  //
  //   it("should create a new reservation with old user", (done) => {
  //     let start = new Date().getTime();
  //     let end = start + 24 * 60 * 60 * 1000;
  //     const input = {
  //       user: {
  //         name: "Sarah",
  //         email: "seheacock@bellsouth.net",
  //         billing: "fghjk",
  //         credit: "Sarah/5105105105105100/Jan 01/2017/555",
  //         cart: [{
  //           start: start,
  //           end: end,
  //           guests: 2,
  //           roomID: room.id,
  //           cost: 100
  //         }]
  //       }
  //     };
  //
  //     let oldUser = new User(input.user);
  //     oldUser.save((err, doc) => {
  //       chai.request(server)
  //       .post('/res/page/' + page.id + "?token=" + token)
  //       .send(input)
  //       .end((err, res) => {
  //         res.should.have.status(200);
  //         res.body.should.have.property('book');
  //         res.body.should.have.property('message').eql(messages.userRes);
  //         res.body.user.should.have.property('token').eql(token);
  //         res.body.user.should.have.property('email').eql('');
  //         done();
  //       });
  //     });
  //   });
  //
  //   // it("should return to admin no longer available if another res made", (done) => {
  //   //   let start = new Date().getTime();
  //   //   let end = start + 24 * 60 * 60 * 1000;
  //   //
  //   //   const myRes = {
  //   //     user: {
  //   //       name: "Sarah",
  //   //       email: "seheacock@bellsouth.net",
  //   //       billing: "fghjk",
  //   //       credit: "Sarah/5105105105105100/Jan 01/2017/555",
  //   //       cart: [
  //   //         {
  //   //           start: start,
  //   //           end: end,
  //   //           guests: 2,
  //   //           roomID: room.id,
  //   //           cost: 100
  //   //         }
  //   //       ]
  //   //     }
  //   //   };
  //   //
  //   //
  //   //
  //   //   const reservation = new Reservation(myRes.user.cart[0]);
  //   //   reservation.save((err, doc) => {
  //   //     chai.request(server)
  //   //     .post('/res/page/' + page.id + "?token=" + token)
  //   //     .send(myRes)
  //   //     .end((err, res) => {
  //   //       res.body.should.be.a('object');
  //   //       res.body.should.have.property('message').eql(messages.available);
  //   //       done();
  //   //     });
  //   //   });
  //   // });
  //
  //   it("should send error if reservations conflict", (done) => {
  //     let start = new Date().getTime();
  //     let end = start + 24 * 60 * 60 * 1000;
  //     const input = {
  //       user: {
  //         token: token,
  //         name: "Sarah",
  //         email: "seheacock@bellsouth.net",
  //         billing: "fghjk",
  //         credit: "Sarah/5105105105105100/Jan 01/2017/555",
  //         cart: [{
  //           start: start,
  //           end: end,
  //           guests: 2,
  //           roomID: room.id,
  //           cost: 100
  //         },
  //         {
  //           start: start,
  //           end: end,
  //           guests: 2,
  //           roomID: room.id,
  //           cost: 100
  //         },
  //         {
  //           start: start,
  //           end: end,
  //           guests: 2,
  //           roomID: room.id,
  //           cost: 100
  //         }]
  //       }
  //     };
  //
  //     chai.request(server)
  //     .post('/res/page/' + page.id + "?token=" + token)
  //     .send(input)
  //     .end((err, res) => {
  //       console.log(res.body);
  //       res.should.have.status(400);
  //       done();
  //     });
  //   });
  //
  //   it("should return expiration message and logout if user not signed in", (done) => {
  //     let start = new Date().getTime();
  //     let end = start + 24 * 60 * 60 * 1000;
  //     const reservation = {
  //       user: {
  //         name: "Sarah",
  //         email: "seheacock@bellsouth.net",
  //         billing: "fghjk",
  //         credit: "Sarah/5105105105105100/Jan 01/2017/555",
  //         cart: [
  //           {
  //             start: start,
  //             end: end,
  //             guests: 2,
  //             roomID: room.id,
  //             cost: 100
  //           }
  //         ]
  //       }
  //     };
  //
  //     chai.request(server)
  //     .post('/res/page/' + page.id + "?token=ghjkl")
  //     .send(reservation)
  //     .end((err, res) => {
  //       res.should.have.status(200);
  //       res.body.should.have.property('message')
  //       res.body.message.should.eql(messages.expError);
  //       res.body.should.have.property('user');
  //       done();
  //     });
  //   });
  // });
  //
  // describe('/PUT update reservation', (done) => {
  //   let user;
  //   let page;
  //   let room;
  //   let token;
  //   let reservation;
  //
  //   let start = new Date().getTime();
  //   let end = start + 24 * 60 * 60 * 1000;
  //
  //   beforeEach((done) => {
  //     user = new User({
  //       name: "Sarah",
  //       email: "seheacock@bellsouth.net",
  //       billing: "fghjk",
  //       credit: "Sarah/5105105105105100/Jan 01/2017/555"
  //     });
  //
  //     page = new Page({
  //       "name": "test",
  //       "password": "password"
  //     });
  //     room = new Room({title: "Foo"});
  //
  //
  //     room.save((err, newRoom) => {
  //       page.gallery.rooms.push(newRoom._id);
  //       page.save((err, newPage) => {
  //         user.pageID = newPage._id;
  //         user.save((err, newUser) => {
  //           token = jwt.sign({userID: newPage.userID}, configure.secret, {
  //             expiresIn: '1d' //expires in one day
  //           });
  //           reservation = new Reservation({
  //             start: start,
  //             end: end,
  //             guests: 2,
  //             roomID: room.id,
  //             userID: user.id,
  //             cost: 100
  //           });
  //           reservation.save((err, newRes) => {done();});
  //         });
  //       });
  //     });
  //   });
  //
  //   it('should check in reservation', (done) => {
  //     chai.request(server)
  //     .put('/res/page/' + page.id + "/checkIn/" + reservation.id + "?token=" + token)
  //     .send(reservation)
  //     .end((err, res) => {
  //       res.should.have.status(200);
  //       res.body.should.have.property('welcome')
  //       res.body.welcome[0]["checkedIn"].eql(true);
  //       done();
  //     });
  //   });
  //
  //   it('should send reminder', (done) => {
  //     chai.request(server)
  //     .put('/res/page/' + page.id + "/reminder/" + reservation.id + "?token=" + token)
  //     .send(reservation)
  //     .end((err, res) => {
  //       res.should.have.status(200);
  //       res.body.should.have.property('welcome')
  //       res.body.welcome[0]["reminded"].eql(true);
  //       done();
  //     });
  //   });
  //
  //   it('should charge client', (done) => {
  //     chai.request(server)
  //     .put('/res/page/' + page.id + "/charge/" + reservation.id + "?token=" + token)
  //     .send(reservation)
  //     .end((err, res) => {
  //       res.should.have.status(200);
  //       res.body.should.have.property('welcome')
  //       res.body.welcome[0]["charged"].eql(true);
  //       res.body.welcome[0]["checkedIn"].eql(true);
  //       done();
  //     });
  //   });
  //
  //   it('should cancel reservation', (done) => {
  //     chai.request(server)
  //     .delete('/res/page/' + page.id + "/cancel/" + reservation.id + "?token=" + token)
  //     .send(reservation)
  //     .end((err, res) => {
  //       res.should.have.status(200);
  //       res.body.should.have.property('welcome');
  //       res.body.welcome.should.be('array').length(0);
  //       done();
  //     });
  //   });
  // });

// });
