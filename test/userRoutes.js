//During the test the env variable is set to test
process.env.NODE_ENV = 'test';

const mongoose = require("mongoose");
const messages = require("../data/data").messages;
const User = require('../server/models/page').User;
const Page = require('../server/models/page').Page;
const jwt = require('jsonwebtoken');
const configure = require('../server/configure/config');

//Require the dev-dependencies
const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../server/index');
const should = chai.should();

chai.use(chaiHttp);
//Our parent block

describe('User', () => {

  before((done) => {
    User.remove({}, (err) => {
      Page.remove({}, (err) => {
        console.log("DELETE USER BEGIN");
        done();
      })
    });
  });

  describe('after user page create', () => {
    let user;
    let page;

    beforeEach((done) => { //Before each test we empty the database
      User.remove({}, (err) => {
        Page.remove({}, (err) => {
          console.log("DELETE USER");
          user = new User({
            name: "test",
            email: "test@gmail.com",
            password: "password"
          });
          page = new Page({
            name: "xcv",
            password: "password"
          });
          user.save((err, newPage) => {
            page.save((err, page) => {
              console.log("CREATE USER");
              done();
            });
          });
        });
      });
    });

    // afterEach((done) => {
    //
    // });

    describe('/POST create user', () => {
      it('should create a new user if all is right and return token', (done) => {
        const user = {
          "name": "test",
          "email": "user@gmail.com",
          "password": "password",
          "Verify Password": "password"
        };

        chai.request(server)
        .post('/user/user')
        .send(user)
        .end((err, res) => {
          //res.should.have.status(201);
          res.body.should.be.a('object');

          res.body.user.should.have.property('email').eql(user.email);
          res.body.user.should.have.property('name').eql(user.name);
          res.body.user.should.have.property('token');
          done();
        });
      });

      it('should return error message if invalid email', (done) => {
        const invalid = {
          name: "test",
          email: "test@gmail",
          password: "password",
          "Verify Password": "password"
        };
        chai.request(server)
        .post('/user/user')
        .send(invalid)
        .end((err, res) => {
          res.body.should.be.a('object');
          res.body.should.have.property('message').eql(messages.emailError);
          done();
        });
      });

      it('should return error message if passwords do not match', (done) => {
        const invalid = {
          name: "test",
          email: "test@gmail.com",
          password: "password",
          "Verify Password": "pass"
        };
        chai.request(server)
        .post('/user/user')
        .send(invalid)
        .end((err, res) => {
          res.body.should.be.a('object');
          res.body.should.have.property('message').eql(messages.passwordError);
          done();
        });
      });

      it('should return error message if form not filled out', (done) => {
        const invalid = {
          name: "test",
          email: "test@gmail.com",
          password: "password"
        };
        chai.request(server)
        .post('/user/user')
        .send(invalid)
        .end((err, res) => {
          res.body.should.be.a('object');
          res.body.should.have.property('message').eql(messages.inputError);
          done();
        });
      });
    });

    describe('/PUT edit user billing and credit', (done) => {
      let token;
      beforeEach(() => {
        token = jwt.sign({userID: user.userID}, configure.secret, {
          expiresIn: '1d' //expires in one day
        });
      });

      it('should edit billing', (done) => {
        const billing = {
          "Address Line 1": "16th Avenue",
          "Address Line 2": "",
          city: "Nashville",
          state: "TN",
          zip: "37212",
          country: "United States",
          phone: "555-555-5555",
          token: token
        };

        chai.request(server)
        .put('/user/user/' + user.id + "/billing")
        .send(billing)
        .end((err, res) => {
          console.log(res.body);
          res.should.have.status(200);
          res.body.should.be.a('object');

          res.body.user.should.have.property('email').eql(user.email);
          res.body.user.should.have.property('name').eql(user.name);
          res.body.user.should.have.property('token');
          res.body.user.should.have.property('billing').eql("16th Avenue//Nashville/TN/37212/United States/+15555555555");
          done();
        });
      });

      it('should edit credit', (done) => {
        // "6011 0000 0000 0000",
        const credit = {
          "name": "test",
          "number": "370 0000 0000 0000",
          "Expiration Month": "Jan 01",
          "Expiration Year": "2050",
          "CVV": "0000",
          "token": token
        };

        chai.request(server)
        .put('/user/user/' + user.id + "/credit")
        .send(credit)
        .end((err, res) => {
          console.log(res.body);
          res.should.have.status(200);
          res.body.should.be.a('object');

          res.body.user.should.have.property('email').eql(user.email);
          res.body.user.should.have.property('name').eql(user.name);
          res.body.user.should.have.property('token');
          res.body.user.should.have.property('credit').eql("test/fa fa-cc-amex/xxxx xxxx xxxx 0000/01 - 2050");
          done();
        });
      });

      it('should return error message if number wrong', (done) => {
        const credit = {
          "name": "test",
          "number": "6011 0000 0000 000",
          "Expiration Month": "Jan 01",
          "Expiration Year": "2050",
          "CVV": "000",
          "token": token
        };

        chai.request(server)
        .put('/user/user/' + user.id + "/credit")
        .send(credit)
        .end((err, res) => {
          res.body.should.be.a('object');
          res.body.should.have.property('message').eql(messages.creditNumError);
          done();
        });
      });

      it('should return error message if CVV wrong', (done) => {
        const credit = {
          "name": "test",
          "number": "6011 0000 0000 0000",
          "Expiration Month": "Jan 01",
          "Expiration Year": "2050",
          "CVV": "00",
          "token": token
        };

        chai.request(server)
        .put('/user/user/' + user.id + "/credit")
        .send(credit)
        .end((err, res) => {
          res.body.should.be.a('object');
          res.body.should.have.property('message').eql(messages.cvvError);
          done();
        });
      });

      it('should return error message if expiration date wrong', (done) => {
        const credit = {
          "name": "test",
          "number": "6011 0000 0000 0000",
          "Expiration Month": "Aug 08",
          "Expiration Year": "2017",
          "CVV": "000",
          "token": token
        };

        chai.request(server)
        .put('/user/user/' + user.id + "/credit")
        .send(credit)
        .end((err, res) => {
          res.body.should.be.a('object');
          res.body.should.have.property('message').eql(messages.creditExpError);
          done();
        });
      });

      it('should return error message if form not filled out', (done) => {
        const billing = {
          "Address Line 1": "16th Avenue",
          "Address Line 2": "",
          city: "Nashville",
          state: "TN",
          zip: "37212",
          country: "United States",
          token: token
        };
        chai.request(server)
        .put('/user/user/' + user.id + "/billing/")
        .send(billing)
        .end((err, res) => {
          res.body.should.be.a('object');
          res.body.should.have.property('message').eql(messages.inputError);
          done();
        });
      });

      it('should return error message if invalid phone number', (done) => {
        const billing = {
          "Address Line 1": "16th Avenue",
          "Address Line 2": "",
          city: "Nashville",
          state: "TN",
          zip: "37212",
          country: "United States",
          phone: "55555",
          token: token
        };
        chai.request(server)
        .put('/user/user/' + user.id + "/billing/")
        .send(billing)
        .end((err, res) => {
          res.body.should.be.a('object');
          res.body.should.have.property('message').eql(messages.phoneError);
          done();
        });
      });

      it('should return error message if expired token', (done) => {
        const billing = {
          "Address Line 1": "16th Avenue",
          "Address Line 2": "",
          city: "Nashville",
          state: "TN",
          zip: "37212",
          country: "United States",
          phone: "555-555-5555",
          token: "vbnm"
        };
        chai.request(server)
        .put('/user/user/' + user.id + "/billing/")
        .send(billing)
        .end((err, res) => {
          res.body.should.be.a('object');
          res.body.should.have.property('message').eql(messages.expError);
          done();
        });
      });
    });

    describe('/POST create user by admin', () => {
      let token;
      beforeEach(() => {
        token = jwt.sign({userID: page.userID}, configure.secret, {
          expiresIn: '1d' //expires in one day
        });
      });

      it('should create a new user if all is right and return admin token', (done) => {
        const newUser = {
          "name": "Sarah",
          "email": "sarah@gmail.com",
          "token": token
        };

        chai.request(server)
        .post('/user/page/' + page.id)
        .send(newUser)
        .end((err, res) => {
          //res.should.have.status(201);
          res.body.should.be.a('object');

          res.body.user.should.have.property('email').eql(newUser.email);
          res.body.user.should.have.property('name').eql(page.name);
          res.body.user.should.have.property('token');
          //res.body.user.should.have.property('_id');
          done();
        });
      });

      it('should user old already exist, use pre-existing info', (done) => {
        const newUser = {
          "name": "Sarah",
          "email": "test@gmail.com",
          "token": token
        };

        chai.request(server)
        .post('/user/page/' + page.id)
        .send(newUser)
        .end((err, res) => {
          res.body.should.be.a('object');
          res.body.edit.modalTitle.should.eql("Continue")
          // res.body.user.should.have.property('email').eql(user.email);
          // res.body.user.should.have.property('billing').eql(user.billing);
          // res.body.user.should.have.property('name').eql(page.name);
          // res.body.user.should.have.property('token');
          // res.body.user.should.have.property('_id').eql(user.id);
          done();
        });
      });

      it('should return error message if admin gives invalid email', (done) => {
        const invalid = {
          name: "test",
          email: "test@gmail",
          token: token
        };
        chai.request(server)
        .post('/user/page/' + page.id)
        .send(invalid)
        .end((err, res) => {
          res.body.should.be.a('object');
          res.body.should.have.property('message').eql(messages.emailError);
          done();
        });
      });

      it('should return error sign up form not filled out', (done) => {
        const invalid = {
          name: "test",
          token: token
        };
        chai.request(server)
        .post('/user/page/' + page.id)
        .send(invalid)
        .end((err, res) => {
          res.body.should.be.a('object');
          res.body.should.have.property('message').eql(messages.inputError);
          done();
        });
      });

      it('should return exp error if admin token expired', (done) => {
        const invalid = {
          name: "test",
          email: "test@gmail.com",
          token: "token"
        };
        chai.request(server)
        .post('/user/page/' + page.id)
        .send(invalid)
        .end((err, res) => {
          res.body.should.be.a('object');
          res.body.should.have.property('message').eql(messages.expError);
          done();
        });
      });
    });

    describe('/PUT admin editing user', (done) => {
      let token;
      beforeEach(() => {
        token = jwt.sign({userID: page.userID}, configure.secret, {
          expiresIn: '1d' //expires in one day
        });
      });

      it('should edit billing', (done) => {
        const billing = {
          "Address Line 1": "16th Avenue",
          "Address Line 2": "",
          city: "Nashville",
          state: "TN",
          zip: "37212",
          country: "United States",
          phone: "555-555-5555",
          token: token
        };

        chai.request(server)
        .put('/user/page/' + page.id + "/" + user.id + "/billing")
        .send(billing)
        .end((err, res) => {
          console.log(res.body);
          res.should.have.status(200);
          res.body.should.be.a('object');

          res.body.user.should.have.property('email').eql(user.email);
          res.body.user.should.have.property('name').eql(page.name);
          res.body.user.should.have.property('token');
          res.body.user.should.have.property('billing').eql("16th Avenue//Nashville/TN/37212/United States/+15555555555");
          done();
        });
      });
    });
  });
});
