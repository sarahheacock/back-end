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
      name: "test",
      password: "password"
    };

    it('it should create a new page rates', (done) => {
      chai.request(server)
      .post('/page')
      .send(page)
      .end((err, res) => {
        res.should.have.status(201);
        res.body.should.be.a('object');

        res.body.should.have.property('name').eql(page.name);
        res.body.should.have.property('password');

        res.body.should.have.property('home').eql({"p1": "We are excited to have you!",
          "title": "Welcome to our bed and breakfast...",
          "image": "pexels-photo_orp8gu"})
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
      const page = new Page({name: "test", password: "password"});

      page.save((err, page) => {
        chai.request(server)
        .get('/page/' + page.id)
        .send(page)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.data.should.have.property('home');
          res.body.data.should.have.property('gallery');
          res.body.data.should.have.property('local-guide');
          done();
        });
      });
    });
  });

  describe('/POST local-guide or room to pageID', () => {
    let page;
    let token;
    beforeEach((done) => { //Before each test we empty the database
      page = new Page({
        "name": "test",
        "password": "password"
      });

      token = jwt.sign({userID: page.userID}, configure.secret, {
        expiresIn: '1d' //expires in one day
      });

      page.save((err, newPage) => { done(); });
    });


    it('add room to gallery when all form items are filled', (done) => {

      const room = {
        "cost": 150,
        "maximum-occupancy": 2,
        "available": 1,
        "title": "Title",
        "carousel": [
          "Tile-Dark-Grey-Smaller-White-97_pxf5ux"
        ],
        "image": "Tile-Dark-Grey-Smaller-White-97_pxf5ux",
        "token": token
      };

      chai.request(server)
      .post('/page/' + page.id + "/gallery")
      .send(room)
      .end((err, res) => {
        res.should.have.status(201);
        res.body.should.be.a('object');
        res.body.should.have.property('edit');
        res.body.should.have.property('data');
        res.body.should.have.property('message');

        res.body.data.gallery.rooms[1].should.have.property('cost').eql(150);
        done();
      });
    });

    it('add LocalGuide to guide when all form items are filled', (done) => {

      const guide = {
        "title": "Title",
        "category": "shopping",
        "address": "fghj",
        "image": "ghjk",
        "token": token
      };

      chai.request(server)
      .post('/page/' + page.id + "/local-guide")
      .send(guide)
      .end((err, res) => {
        res.should.have.status(201);
        res.body.should.be.a('object');
        res.body.should.have.property('edit');
        res.body.should.have.property('data');
        res.body.should.have.property('message');

        res.body.data["local-guide"]["guide"][1].should.have.property('category').eql('shopping');
        done();
      });
    });

    it('should return an error if required not included', (done) => {

      const invalid = {
        "available": 1,
        "title": "Title",
        "b": "It's a really nice room.",
        "p1": "Hi",
        "carousel": [
          "Tile-Dark-Grey-Smaller-White-97_pxf5ux"
        ],
        "image": "Tile-Dark-Grey-Smaller-White-97_pxf5ux",
        "token": token
      };

      chai.request(server)
      .post('/page/' + page.id + "/gallery")
      .send(invalid)
      .end((err, res) => {
        console.log(res.body);
        res.body.should.be.a('object');
        res.body.should.have.property('message').eql(messages.inputError);
        done();
      });
    });

    it('should return an error if required not included', (done) => {

      const invalid = {
        "title": "Title",
        "category": "shopping",
        "someKey": "fghj",
        "image": "ghjk",
        "token": token
      };

      chai.request(server)
      .post('/page/' + page.id + "/local-guide")
      .send(invalid)
      .end((err, res) => {
        console.log(res.body);
        res.body.should.be.a('object');
        res.body.should.have.property('message').eql(messages.inputError);
        done();
      });
    });

    it('should return an expired session if token is wrong', (done) => {

      const rate = {
        "cost": 150,
        "maximum-occupancy": 2,
        "available": 1,
        "title": "Title",
        "carousel": [
          "Tile-Dark-Grey-Smaller-White-97_pxf5ux"
        ],
        "image": "Tile-Dark-Grey-Smaller-White-97_pxf5ux",
        "token": "vbm"
      };

      chai.request(server)
      .post('/page/' + page.id + "/gallery")
      .send(rate)
      .end((err, res) => {
        res.body.should.be.a('object');
        res.body.should.have.property('message').eql(messages.expError);
        done();
      });
    });

    it('should return unauthorized if no token provided', (done) => {
      const rate = {
        "cost": 150,
        "maximum-occupancy": 2,
        "available": 1,
        "title": "Title",
        "carousel": [
          "Tile-Dark-Grey-Smaller-White-97_pxf5ux"
        ],
        "image": "Tile-Dark-Grey-Smaller-White-97_pxf5ux"
      };

      chai.request(server)
      .post('/page/' + page.id + "/gallery")
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
        "name": "test",
        "password": "password"
      });

      token = jwt.sign({userID: page.userID}, configure.secret, {
        expiresIn: '1d' //expires in one day
      });

      page.save((err, newPage) => { done(); });
    });

    it('edit gallery.title when all form items are filled', (done) => {

      const p1 = {
        "title": "Hello!",
        "token": token
      };

      chai.request(server)
      .put('/page/' + page.id + "/gallery/")
      .send(p1)
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.data.gallery.should.have.property('title').eql(p1.title);
        done();
      });
    });

    it('should return an error if editing content not on form', (done) => {

      const invalid = {
        "title": "hello",
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
        "name": "test",
        "password": "password"
      });

      token = jwt.sign({userID: page.userID}, configure.secret, {
        expiresIn: '1d' //expires in one day
      });

      page.save((err, newPage) => { done(); });
    });

    it('edit room when all form items are filled', (done) => {

      const room = {
        "cost": 200,
        "maximum-occupancy": 2,
        "available": 1,
        "title": "Title",
        "carousel": [
          "Tile-Dark-Grey-Smaller-White-97_pxf5ux"
        ],
        "image": "Tile-Dark-Grey-Smaller-White-97_pxf5ux",
        "token": token
      };

      chai.request(server)
      .put('/page/' + page.id + "/gallery/" + page.gallery.rooms[0].id)
      .send(room)
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('data');
        res.body.should.have.property('edit');
        res.body.should.have.property('message');
        res.body.data.gallery.rooms[0].should.have.property('cost').eql(200);
        res.body.data.gallery.rooms[0].should.have.property('p1').eql("Semiotics pinterest DIY beard, cold-pressed kombucha vape meh flexitarian YOLO cronut subway tile gastropub. Trust fund 90's small batch, skateboard cornhole deep v actually before they sold out thundercats XOXO celiac meditation lomo hexagon tofu. Skateboard air plant narwhal, everyday carry waistcoat pop-up pinterest kitsch. Man bun vape banh mi, palo santo kinfolk sustainable selfies pug meditation kale chips organic PBR&B vegan pok pok. Lomo flexitarian viral yr man braid vexillologist. Bushwick williamsburg bicycle rights, sriracha succulents godard single-origin coffee fam activated charcoal.");
        done();
      });
    });

    it('should return an error if required not included', (done) => {

      const invalid = {
        "maximum-occupancy": 2,
        "available": 1,
        "title": "Title",
        "carousel": [
          "Tile-Dark-Grey-Smaller-White-97_pxf5ux"
        ],
        "image": "Tile-Dark-Grey-Smaller-White-97_pxf5ux",
        "token": token
      };

      chai.request(server)
      .put('/page/' + page.id + "/gallery/" + page.gallery.rooms[0].id)
      .send(invalid)
      .end((err, res) => {
        console.log(res.body);
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
        "name": "test",
        "password": "password"
      });

      token = jwt.sign({userID: page.userID}, configure.secret, {
        expiresIn: '1d' //expires in one day
      });
      page.save((err, newPage) => { done(); });
    });


    it('should delete rates', (done) => {

      chai.request(server)
      .delete('/page/' + page.id + "/gallery/" + page.gallery.rooms[0].id + "?token=" + token)
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('data')
        res.body.data.gallery.rooms.should.be.a('array').length(0);
        done();
      });
    });
  });
});
