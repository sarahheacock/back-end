// //During the test the env variable is set to test
// process.env.NODE_ENV = 'test';
//
// const mongoose = require("mongoose");
// const messages = require("../data/data").messages;
// const User = require('../server/models/page').User;
// const jwt = require('jsonwebtoken');
// const configure = require('../server/configure/config');
//
// //Require the dev-dependencies
// const chai = require('chai');
// const chaiHttp = require('chai-http');
// const server = require('../server/index');
// const should = chai.should();
//
// chai.use(chaiHttp);
// //Our parent block
//
// describe('User', () => {
//   beforeEach((done) => {
//     User.remove({}, (err) => { done(); });
//   });
//
//   describe('/POST user login', () => {
//     const login = {
//       "username": "test@gmail.com",
//       "password": "password",
//       "admin": false
//     };
//
//     const invalidForm = {
//       "username": "test@gmail.com"
//     };
//
//     const invaliduser = {
//       "username": "t",
//       "password": "password",
//       "admin": false
//     };
//
//     const invalidPassword = {
//       "username": "test@gmail.com",
//       "password": "pass",
//       "admin": false
//     };
//
//     let user;
//     beforeEach((done) => { //Before each test we empty the database
//       user = new User({
//         "name": "test",
//         "email": "test@gmail.com",
//         "password": "password"
//       });
//
//       user.save((err, newPage) => { done(); });
//     });
//
//     it('it should return fill out required fields', (done) => {
//       user.save((err, user) => {
//         chai.request(server)
//         .post('/login')
//         .send(invalidForm)
//         .end((err, res) => {
//           res.body.should.be.a('object');
//           res.body.should.have.property('message').eql(messages.inputError);
//           done();
//         });
//       });
//     });
//
//     it('it should return no user if not found', (done) => {
//       user.save((err, user) => {
//         chai.request(server)
//         .post('/login')
//         .send(invaliduser)
//         .end((err, res) => {
//           res.body.should.be.a('object');
//           res.body.should.have.property('message').eql(messages.usernameError);
//           done();
//         });
//       });
//     });
//
//     it('it should return invalid password if wrong', (done) => {
//       user.save((err, user) => {
//         chai.request(server)
//         .post('/login')
//         .send(invalidPassword)
//         .end((err, res) => {
//           res.body.should.be.a('object');
//           res.body.should.have.property('message').eql(messages.passError);
//           done();
//         });
//       });
//     });
//   });
//
//   describe('/POST create user', () => {
//     const user = {
//       "name": "test",
//       "email": "test@gmail.com",
//       "password": "password",
//       "Verify Password": "password"
//     };
//
//     it('should create a new user if all is right and return token', (done) => {
//       chai.request(server)
//       .post('/user')
//       .send(user)
//       .end((err, res) => {
//         res.should.have.status(201);
//         res.body.should.be.a('object');
//
//         res.body.user.should.have.property('email').eql(user.email);
//         res.body.user.should.have.property('name').eql(user.name);
//         res.body.user.should.have.property('token');
//         done();
//       });
//     });
//
//     it('should return error message if invalid email', (done) => {
//       const invalid = {
//         name: "test",
//         email: "test@gmail",
//         password: "password",
//         "Verify Password": "password"
//       };
//       chai.request(server)
//       .post('/user')
//       .send(invalid)
//       .end((err, res) => {
//         res.body.should.be.a('object');
//         res.body.should.have.property('message').eql(messages.emailError);
//         done();
//       });
//     });
//
//     it('should return error message if passwords do not match', (done) => {
//       const invalid = {
//         name: "test",
//         email: "test@gmail.com",
//         password: "password",
//         "Verify Password": "pass"
//       };
//       chai.request(server)
//       .post('/user')
//       .send(invalid)
//       .end((err, res) => {
//         res.body.should.be.a('object');
//         res.body.should.have.property('message').eql(messages.passwordError);
//         done();
//       });
//     });
//
//     it('should return error message if form not filled out', (done) => {
//       const invalid = {
//         name: "test",
//         email: "test@gmail.com",
//         password: "password"
//       };
//       chai.request(server)
//       .post('/user')
//       .send(invalid)
//       .end((err, res) => {
//         res.body.should.be.a('object');
//         res.body.should.have.property('message').eql(messages.inputError);
//         done();
//       });
//     });
//   });
//
//   describe('/PUT edit user billing and credit', (done) => {
//     let user;
//     let token;
//     beforeEach((done) => { //Before each test we empty the database
//       user = new User({
//         name: "test",
//         email: "test@gmail.com",
//         password: "password"
//       });
//
//       user.save((err, newPage) => {
//         token = jwt.sign({userID: user.userID}, configure.secret, {
//           expiresIn: '1d' //expires in one day
//         });
//         done();
//       });
//     });
//
//     it('should edit billing', (done) => {
//       const billing = {
//         "Address Line 1": "16th Avenue",
//         "Address Line 2": "",
//         city: "Nashville",
//         state: "TN",
//         zip: "37212",
//         country: "United States",
//         phone: "555-555-5555",
//         token: token
//       };
//
//       chai.request(server)
//       .put('/user/' + user.id + "/billing")
//       .send(billing)
//       .end((err, res) => {
//         console.log(res.body);
//         res.should.have.status(200);
//         res.body.should.be.a('object');
//
//         res.body.user.should.have.property('email').eql(user.email);
//         res.body.user.should.have.property('name').eql(user.name);
//         res.body.user.should.have.property('token');
//         res.body.user.should.have.property('billing').eql("16th Avenue//Nashville/TN/37212/United States/555-555-5555");
//         done();
//       });
//     });
//
//     it('should edit credit', (done) => {
//       // "6011 0000 0000 0000",
//       const credit = {
//         "name": "test",
//         "number": "370 0000 0000 0000",
//         "Expiration Month": "Jan 01",
//         "Expiration Year": "2050",
//         "CVV": "0000",
//         "token": token
//       };
//
//       chai.request(server)
//       .put('/user/' + user.id + "/credit")
//       .send(credit)
//       .end((err, res) => {
//         res.should.have.status(200);
//         res.body.should.be.a('object');
//
//         res.body.user.should.have.property('email').eql(user.email);
//         res.body.user.should.have.property('name').eql(user.name);
//         res.body.user.should.have.property('token');
//         res.body.user.should.have.property('credit').eql("test/370000000000000/Jan 01/2050/0000");
//         done();
//       });
//     });
//
//     it('should return error message if number wrong', (done) => {
//       const credit = {
//         "name": "test",
//         "number": "6011 0000 0000 000",
//         "Expiration Month": "Jan 01",
//         "Expiration Year": "2050",
//         "CVV": "000",
//         "token": token
//       };
//
//       chai.request(server)
//       .put('/user/' + user.id + "/credit")
//       .send(credit)
//       .end((err, res) => {
//         res.body.should.be.a('object');
//         res.body.should.have.property('message').eql(messages.creditNumError);
//         done();
//       });
//     });
//
//     it('should return error message if CVV wrong', (done) => {
//       const credit = {
//         "name": "test",
//         "number": "6011 0000 0000 0000",
//         "Expiration Month": "Jan 01",
//         "Expiration Year": "2050",
//         "CVV": "00",
//         "token": token
//       };
//
//       chai.request(server)
//       .put('/user/' + user.id + "/credit")
//       .send(credit)
//       .end((err, res) => {
//         res.body.should.be.a('object');
//         res.body.should.have.property('message').eql(messages.cvvError);
//         done();
//       });
//     });
//
//     it('should return error message if expiration date wrong', (done) => {
//       const credit = {
//         "name": "test",
//         "number": "6011 0000 0000 0000",
//         "Expiration Month": "Aug 08",
//         "Expiration Year": "2017",
//         "CVV": "000",
//         "token": token
//       };
//
//       chai.request(server)
//       .put('/user/' + user.id + "/credit")
//       .send(credit)
//       .end((err, res) => {
//         res.body.should.be.a('object');
//         res.body.should.have.property('message').eql(messages.creditExpError);
//         done();
//       });
//     });
//
//     it('should return error message if form not filled out', (done) => {
//       const billing = {
//         "Address Line 1": "16th Avenue",
//         "Address Line 2": "",
//         city: "Nashville",
//         state: "TN",
//         zip: "37212",
//         country: "United States",
//         token: token
//       };
//       chai.request(server)
//       .put('/user/' + user.id + "/billing/")
//       .send(billing)
//       .end((err, res) => {
//         res.body.should.be.a('object');
//         res.body.should.have.property('message').eql(messages.inputError);
//         done();
//       });
//     });
//
//     it('should return error message if invalid phone number', (done) => {
//       const billing = {
//         "Address Line 1": "16th Avenue",
//         "Address Line 2": "",
//         city: "Nashville",
//         state: "TN",
//         zip: "37212",
//         country: "United States",
//         phone: "55555",
//         token: token
//       };
//       chai.request(server)
//       .put('/user/' + user.id + "/billing/")
//       .send(billing)
//       .end((err, res) => {
//         res.body.should.be.a('object');
//         res.body.should.have.property('message').eql(messages.phoneError);
//         done();
//       });
//     });
//
//     it('should return error message if expired token', (done) => {
//       const billing = {
//         "Address Line 1": "16th Avenue",
//         "Address Line 2": "",
//         city: "Nashville",
//         state: "TN",
//         zip: "37212",
//         country: "United States",
//         phone: "555-555-5555",
//         token: "vbnm"
//       };
//       chai.request(server)
//       .put('/user/' + user.id + "/billing/")
//       .send(billing)
//       .end((err, res) => {
//         res.body.should.be.a('object');
//         res.body.should.have.property('message').eql(messages.expError);
//         done();
//       });
//     });
//   });
// });
