//During the test the env variable is set to test
process.env.NODE_ENV = 'test';

const mongoose = require("mongoose");
const messages = require("../data/data").messages;
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
describe('Pages', () => {

  beforeEach((done) => { //Before each test we empty the database
    Page.remove({}, (err) => { done(); });
  });

  describe('/POST page', () => {
    const page = {
      username: "test",
      password: "password"
    };

    it('it should create a new page rates', (done) => {
      chai.request(server)
      .post('/page')
      .send(page)
      .end((err, res) => {
        res.should.have.status(201);
        res.body.should.be.a('object');

        res.body.should.have.property('username').eql(page.username);
        res.body.should.have.property('password');

        res.body.should.have.property('services').eql({
          "Areas Serviced": [
            "Norwest Columbus including zip codes:",
            "43235, 43017, 43016, 43002, 43220, 43085, 43221, 43214"
          ],
          "Other Services if on Vacation": {
            "Alter lights & shades": "fa fa-lightbulb-o",
            "Water plants": "fa fa-leaf",
            "Collect mail": "fa fa-envelope-o"
          },
          "Pet Services Provided": {
            "House sitting": "fa fa-home",
            "Transportation": "fa fa-car",
            "Brushing & Bathing": "fa fa-bath",
            "Medication administration": "fa fa-medkit",
            "Waste pick up & disposal": "fi-trash",
            "Care & feeding": "fa fa-heart",
            "Dog Walking": "fi-guide-dog large-icon",
            "Pet Sitting": "fa fa-paw"
          }
        })
        done();
      });
    });
  });

  describe('/GET/:id page', () => {
    it('it should return error if page not found', (done) => {
      chai.request(server)
      .get('/page/594952df122ff83a0f190050/')
      .end((err, res) => {
        res.should.have.status(404);
        res.body.should.have.property('error').eql({message: "Page Not Found"});
        done();
      });
    });

    it('it should GET a page by the given id but only return needed info', (done) => {
      const page = new Page({username: "test", password: "password"});

      page.save((err, page) => {
        chai.request(server)
        .get('/page/' + page.id)
        .send(page)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.rate.should.have.property('home');
          res.body.rate.should.have.property('rates');
          res.body.rate.should.have.property('services');
          res.body.rate.should.have.property('footer');
          res.body.rate.should.have.property('contact');
          done();
        });
      });
    });
  });

  describe('/POST rate to pageID', () => {
    let page;
    let token;
    beforeEach((done) => { //Before each test we empty the database
      page = new Page({
        "username": "test",
        "password": "password"
      });

      token = jwt.sign({userID: page.userID}, configure.secret, {
        expiresIn: '1d' //expires in one day
      });

      page.save((err, newPage) => { done(); });
    });


    it('add rate when all form items are filled', (done) => {

      const rate = {
        "description": "Good for...",
        "title": "Pampered Paws",
        "time": "10 minutes",
        "cost": "10",
        "token": token
      };

      chai.request(server)
      .post('/page/' + page.id + "/rates")
      .send(rate)
      .end((err, res) => {
        res.should.have.status(201);
        res.body.should.be.a('object');
        res.body.should.have.property('edit');
        res.body.should.have.property('rate');
        res.body.should.have.property('message');

        res.body.rate.rates.rate[1].should.have.property('cost').eql("10");
        done();
      });
    });

    it('should return an error if required not included', (done) => {

      const invalid = {
        "description": "Good for...",
        "title": "Pampered Paws",
        "token": token
      };

      chai.request(server)
      .post('/page/' + page.id + "/rates")
      .send(invalid)
      .end((err, res) => {
        res.body.should.be.a('object');
        res.body.should.have.property('message').eql(messages.inputError);
        done();
      });
    });

    it('should return an expired session if token is wrong', (done) => {

      const rate = {
        "description": "Good for...",
        "title": "Pampered Paws",
        "time": "10 minutes",
        "cost": "10",
        token: "vbnm"
      };

      chai.request(server)
      .post('/page/' + page.id + "/rates")
      .send(rate)
      .end((err, res) => {
        res.body.should.be.a('object');
        res.body.should.have.property('message').eql(messages.expError);
        done();
      });
    });

    it('should return unauthorized if no token provided', (done) => {
      const rate = {
        "description": "Good for...",
        "title": "Pampered Paws",
        "time": "10 minutes",
        "cost": "10"
      };

      chai.request(server)
      .post('/page/' + page.id + "/rates")
      .send(rate)
      .end((err, res) => {
        res.should.have.status(401);
        res.body.should.be.a('object');
        res.body.should.have.property('error').eql({message: messages.tokenError});
        done();
      });
    });
  });

  describe('/PUT editing page element', () => {
    //AUTHENTICATION WAS NOT INCLUDED SINCE TESTED IN POST
    let page;
    let token;
    beforeEach((done) => { //Before each test we empty the database
      page = new Page({
        "username": "test",
        "password": "password"
      });

      token = jwt.sign({userID: page.userID}, configure.secret, {
        expiresIn: '1d' //expires in one day
      });

      page.save((err, newPage) => { done(); });
    });

    it('edit rates.p1 when all form items are filled', (done) => {

      const p1 = {
        "p1": "Hello!",
        "token": token
      };

      chai.request(server)
      .put('/page/' + page.id + "/home/")
      .send(p1)
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.rate.home.should.have.property('p1').eql(p1.p1);
        done();
      });
    });

    it('should return an error if editing content not on form', (done) => {

      const invalid = {
        "p1": "hello",
        "image": "abc",
        "token": token
      };

      chai.request(server)
      .put('/page/' + page.id + "/home")
      .send(invalid)
      .end((err, res) => {
        res.should.have.status(400);
        res.body.should.be.a('object');
        res.body.should.have.property('error').eql({message: "Invalid entry"});
        done();
      });
    });
  });

  describe('/PUT editing rate', () => {
    //AUTHENTICATION WAS NOT INCLUDED SINCE TESTED IN POST
    let page;
    let token;
    beforeEach((done) => { //Before each test we empty the database
      page = new Page({
        "username": "test",
        "password": "password"
      });

      token = jwt.sign({userID: page.userID}, configure.secret, {
        expiresIn: '1d' //expires in one day
      });

      page.save((err, newPage) => { done(); });
    });

    it('edit rate when all form items are filled', (done) => {

      const rate = {
        "title": "Pampered Paws",
        "time": "10 minutes",
        "cost": "10",
        "token": token
      };

      chai.request(server)
      .put('/page/' + page.id + "/rates/" + page.rates.rate[0].id)
      .send(rate)
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('rate');
        res.body.should.have.property('edit');
        res.body.should.have.property('message');
        res.body.rate.rates.rate[0].should.have.property('cost').eql("10");
        done();
      });
    });

    it('should return an error if required not included', (done) => {

      const invalid = {
        "description": "Good for...",
        "title": "Pampered Paws",
        "token": token
      };

      chai.request(server)
      .put('/page/' + page.id + "/rates/" + page.rates.rate[0].id)
      .send(invalid)
      .end((err, res) => {
        res.body.should.be.a('object');
        res.body.should.have.property('message').eql(messages.inputError);
        done();
      });
    });
  });

  describe('/DELETE rate to rateID', () => {
    //AUTHENTICATION WAS NOT INCLUDED SINCE TESTED IN POST
    let page;
    let token;
    beforeEach((done) => { //Before each test we empty the database
      page = new Page({
        "username": "test",
        "password": "password"
      });

      token = jwt.sign({userID: page.userID}, configure.secret, {
        expiresIn: '1d' //expires in one day
      });
      page.save((err, newPage) => { done(); });
    });


    it('should delete rates', (done) => {

      chai.request(server)
      .delete('/page/' + page.id + "/rates/" + page.rates.rate[0].id + "?token=" + token)
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('rate')
        res.body.rate.rates.rate.should.be.a('array').length(0);
        done();
      });
    });
  });
});
