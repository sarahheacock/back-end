// //During the test the env variable is set to test
// process.env.NODE_ENV = 'test';
//
// const mongoose = require("mongoose");
// const messages = require("../data/data").messages;
// const Page = require('../server/models/page').Page;
// const Room = require('../server/models/page').Room;
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
// describe('Pages', () => {
//
//   beforeEach((done) => { //Before each test we empty the database
//     Page.remove({}, (err) => {
//       Room.remove({}, (err) => {
//         done();
//       });
//     });
//   });
//
//   describe('/POST page', () => {
//     const page = {
//       name: "test",
//       password: "password"
//     };
//
//     it('it should create a new page rates', (done) => {
//       chai.request(server)
//       .post('/page')
//       .send(page)
//       .end((err, res) => {
//         res.should.have.status(201);
//         res.body.should.be.a('object');
//
//         res.body.should.have.property('name').eql(page.name);
//         res.body.should.have.property('password');
//
//         res.body.should.have.property('home').eql({"p1": "We are excited to have you!",
//           "title": "Welcome to our bed and breakfast...",
//           "image": "pexels-photo_orp8gu"})
//         done();
//       });
//     });
//   });
//
//   describe('/GET/:id page', () => {
//     it('it should return error if page not found', (done) => {
//       chai.request(server)
//       .get('/page/594952df122ff83a0f190050/')
//       .end((err, res) => {
//         res.should.have.status(404);
//         res.body.should.have.property('error').eql({message: "Page Not Found"});
//         done();
//       });
//     });
//
//     it('it should GET a page by the given id but only return needed info', (done) => {
//       const page = new Page({name: "test", password: "password"});
//
//       page.save((err, page) => {
//         chai.request(server)
//         .get('/page/' + page.id)
//         .send(page)
//         .end((err, res) => {
//           res.should.have.status(200);
//           res.body.should.be.a('object');
//           res.body.should.have.property('home');
//           res.body.should.have.property('gallery');
//           res.body.should.have.property('guide');
//           done();
//         });
//       });
//     });
//   });
//
//   describe('/POST guide or room to pageID', () => {
//     let page;
//     let token;
//     beforeEach((done) => { //Before each test we empty the database
//       page = new Page({
//         "name": "test",
//         "password": "password"
//       });
//
//       token = jwt.sign({userID: page.userID}, configure.secret, {
//         expiresIn: '1d' //expires in one day
//       });
//
//       page.save((err, newPage) => { done(); });
//     });
//
//
//     it('add room to gallery when all form items are filled', (done) => {
//
//       const room = {
//         "cost": 150,
//         "maximum-occupancy": 2,
//         "available": 1,
//         "title": "Title",
//         "carousel": [
//           "Tile-Dark-Grey-Smaller-White-97_pxf5ux"
//         ],
//         "image": "Tile-Dark-Grey-Smaller-White-97_pxf5ux",
//         "token": token
//       };
//
//       chai.request(server)
//       .post('/page/' + page.id + "/room")
//       .send(room)
//       .end((err, res) => {
//         res.should.have.status(201);
//         res.body.should.be.a('object');
//         res.body.should.have.property('edit');
//         res.body.should.have.property('home');
//         res.body.should.have.property('gallery');
//         res.body.should.have.property('guide');
//         res.body.should.have.property('message');
//
//         res.body.gallery.rooms[0].should.have.property('cost').eql(150);
//         done();
//       });
//     });
//
//     it('add LocalGuide to guide when all form items are filled', (done) => {
//
//       const guide = {
//         "title": "Title",
//         "category": "shopping",
//         "address": "fghj",
//         "image": "ghjk",
//         "token": token
//       };
//
//       chai.request(server)
//       .post('/page/' + page.id + "/guide")
//       .send(guide)
//       .end((err, res) => {
//         res.should.have.status(201);
//         res.body.should.be.a('object');
//         res.body.should.have.property('edit');
//         res.body.should.have.property('gallery');
//         res.body.should.have.property('guide');
//         res.body.should.have.property('message');
//
//         res.body["guide"]["guide"][1].should.have.property('category').eql('shopping');
//         done();
//       });
//     });
//
//     it('should return an error if required room input not included', (done) => {
//
//       const invalid = {
//         "available": 1,
//         "b": "It's a really nice room.",
//         "p1": "Hi",
//         "carousel": [
//           "Tile-Dark-Grey-Smaller-White-97_pxf5ux"
//         ],
//         "image": "Tile-Dark-Grey-Smaller-White-97_pxf5ux",
//         "token": token
//       };
//
//       chai.request(server)
//       .post('/page/' + page.id + "/room")
//       .send(invalid)
//       .end((err, res) => {
//         res.body.should.be.a('object');
//         res.body.should.have.property('message').eql(messages.inputError);
//         done();
//       });
//     });
//
//     it('should return an error if required guide input not included', (done) => {
//
//       const invalid = {
//         "title": "Title",
//         "category": "shopping",
//         "someKey": "fghj",
//         "image": "ghjk",
//         "token": token
//       };
//
//       chai.request(server)
//       .post('/page/' + page.id + "/guide")
//       .send(invalid)
//       .end((err, res) => {
//         res.body.should.be.a('object');
//         res.body.should.have.property('message').eql(messages.inputError);
//         done();
//       });
//     });
//
//     it('should return an expired session if token is wrong', (done) => {
//
//       const rate = {
//         "cost": 150,
//         "maximum-occupancy": 2,
//         "available": 1,
//         "title": "Title",
//         "carousel": [
//           "Tile-Dark-Grey-Smaller-White-97_pxf5ux"
//         ],
//         "image": "Tile-Dark-Grey-Smaller-White-97_pxf5ux",
//         "token": "vbm"
//       };
//
//       chai.request(server)
//       .post('/page/' + page.id + "/room")
//       .send(rate)
//       .end((err, res) => {
//         res.body.should.be.a('object');
//         res.body.should.have.property('message').eql(messages.expError);
//         done();
//       });
//     });
//
//     it('should return unauthorized if no token provided', (done) => {
//       const rate = {
//         "cost": 150,
//         "maximum-occupancy": 2,
//         "available": 1,
//         "title": "Title",
//         "carousel": [
//           "Tile-Dark-Grey-Smaller-White-97_pxf5ux"
//         ],
//         "image": "Tile-Dark-Grey-Smaller-White-97_pxf5ux"
//       };
//
//       chai.request(server)
//       .post('/page/' + page.id + "/room")
//       .send(rate)
//       .end((err, res) => {
//         res.should.have.status(401);
//         res.body.should.be.a('object');
//         res.body.should.have.property('error').eql({message: messages.tokenError});
//         done();
//       });
//     });
//   });
//
//   describe('/PUT editing page element', () => {
//     //AUTHENTICATION WAS NOT INCLUDED SINCE TESTED IN POST
//     let page;
//     let token;
//     beforeEach((done) => { //Before each test we empty the database
//       page = new Page({
//         "name": "test",
//         "password": "password"
//       });
//
//       token = jwt.sign({userID: page.userID}, configure.secret, {
//         expiresIn: '1d' //expires in one day
//       });
//
//       page.save((err, newPage) => { done(); });
//     });
//
//     it('edit gallery.title when all form items are filled', (done) => {
//
//       const p1 = {
//         "title": "Hello!",
//         "token": token
//       };
//
//       chai.request(server)
//       .put('/page/' + page.id + "/gallery/")
//       .send(p1)
//       .end((err, res) => {
//         res.should.have.status(200);
//         res.body.should.be.a('object');
//         res.body.gallery.should.have.property('title').eql(p1.title);
//         done();
//       });
//     });
//
//     it('should return an error if editing content not on form', (done) => {
//
//       const invalid = {
//         "title": "hello",
//         "image": "abc",
//         "token": token
//       };
//
//       chai.request(server)
//       .put('/page/' + page.id + "/home")
//       .send(invalid)
//       .end((err, res) => {
//         res.should.have.status(400);
//         res.body.should.be.a('object');
//         res.body.should.have.property('error').eql({message: "Invalid entry"});
//         done();
//       });
//     });
//   });
//
//   describe('/PUT editing guide', () => {
//     //AUTHENTICATION WAS NOT INCLUDED SINCE TESTED IN POST
//     let page;
//     let token;
//     beforeEach((done) => { //Before each test we empty the database
//       page = new Page({
//         "name": "test",
//         "password": "password"
//       });
//
//       token = jwt.sign({userID: page.userID}, configure.secret, {
//         expiresIn: '1d' //expires in one day
//       });
//
//       page.save((err, newPage) => { done(); });
//     });
//
//     it('edit guide when all form items are filled', (done) => {
//
//       const guide = {
//         "category": "Restaurants & Coffee Shops",
//         "image": "Tile-Dark-Grey-Smaller-White-97_pxf5ux",
//         "link": "#",
//         "address": "1640 Gateway Road, Portland, Oregon 97232",
//         "p1": "Plaid live-edge yr, meh put a bird on it enamel pin godard cornhole drinking vinegar banh mi flannel pug. Art party fixie lo-fi shabby chic forage. Meh craft beer blog, chicharrones small batch knausgaard flexitarian ugh banh mi. Occupy tattooed franzen, actually unicorn umami synth. Tacos godard kickstarter shaman cred pour-over. Offal pickled trust fund beard letterpress asymmetrical post-ironic jean shorts. Ethical shabby chic vape deep v vice woke af.",
//         "title": "Coffee",
//         "token": token
//       };
//
//       chai.request(server)
//       .put('/page/' + page.id + "/guide/" + page["guide"].guide[0].id)
//       .send(guide)
//       .end((err, res) => {
//         res.should.have.status(200);
//         res.body.should.be.a('object');
//         res.body.should.have.property('edit');
//         res.body.should.have.property('message');
//         res.body["guide"]["guide"][0].should.have.property('title').eql("Coffee");
//         done();
//       });
//     });
//
//     it('should return an error if room required not included', (done) => {
//
//       const invalid = {
//         "category": "Restaurants & Coffee Shops",
//         "image": "Tile-Dark-Grey-Smaller-White-97_pxf5ux",
//         "link": "#",
//         "address": "1640 Gateway Road, Portland, Oregon 97232",
//         "p1": "Plaid live-edge yr, meh put a bird on it enamel pin godard cornhole drinking vinegar banh mi flannel pug. Art party fixie lo-fi shabby chic forage. Meh craft beer blog, chicharrones small batch knausgaard flexitarian ugh banh mi. Occupy tattooed franzen, actually unicorn umami synth. Tacos godard kickstarter shaman cred pour-over. Offal pickled trust fund beard letterpress asymmetrical post-ironic jean shorts. Ethical shabby chic vape deep v vice woke af.",
//         "token": token
//       };
//
//       chai.request(server)
//       .put('/page/' + page.id + "/guide/" + page["guide"].guide[0].id)
//       .send(invalid)
//       .end((err, res) => {
//         res.body.should.be.a('object');
//         res.body.should.have.property('message').eql(messages.inputError);
//         done();
//       });
//     });
//
//   });
//
//   describe('/PUT editing room', () => {
//     //AUTHENTICATION WAS NOT INCLUDED SINCE TESTED IN POST
//     let page;
//     let room;
//     let token;
//     beforeEach((done) => { //Before each test we empty the database
//       page = new Page({
//         "name": "test",
//         "password": "password"
//       });
//       room = new Room();
//
//       token = jwt.sign({userID: page.userID}, configure.secret, {
//         expiresIn: '1d' //expires in one day
//       });
//
//       room.save((err, newRoom) => {
//         page.gallery.rooms.push(newRoom._id);
//         page.save((err, newPage) => { done(); });
//       });
//
//     });
//
//     it('edit room when all form items are filled', (done) => {
//
//       const input = {
//         "cost": 200,
//         "maximum-occupancy": 2,
//         "available": 1,
//         "title": "Swan",
//         "carousel": [
//           "Tile-Dark-Grey-Smaller-White-97_pxf5ux"
//         ],
//         "image": "Tile-Dark-Grey-Smaller-White-97_pxf5ux",
//         "token": token
//       };
//
//       chai.request(server)
//       .put('/page/' + page.id + "/room/" + room._id)
//       .send(input)
//       .end((err, res) => {
//         res.should.have.status(200);
//         res.body.should.be.a('object');
//         res.body.should.have.property('edit');
//         res.body.should.have.property('message');
//         res.body.gallery.rooms[0].should.have.property('cost').eql(200);
//         res.body.gallery.rooms[0].should.have.property('title').eql("Swan");
//         done();
//       });
//     });
//
//     it('should return an error if room required not included', (done) => {
//
//       const invalid = {
//         "maximum-occupancy": 2,
//         "available": 1,
//         "title": "Swan",
//         "carousel": [
//           "Tile-Dark-Grey-Smaller-White-97_pxf5ux"
//         ],
//         "image": "Tile-Dark-Grey-Smaller-White-97_pxf5ux",
//         "token": token
//       };
//
//       chai.request(server)
//       .put('/page/' + page.id + "/room/" + room.id)
//       .send(invalid)
//       .end((err, res) => {
//         res.body.should.be.a('object');
//         res.body.should.have.property('message').eql(messages.inputError);
//         done();
//       });
//     });
//
//   });
//
//   describe('/DELETE guide to guideID', () => {
//     //AUTHENTICATION WAS NOT INCLUDED SINCE TESTED IN POST
//     let page;
//     let token;
//     beforeEach((done) => { //Before each test we empty the database
//       page = new Page({
//         "name": "test",
//         "password": "password"
//       });
//
//       token = jwt.sign({userID: page.userID}, configure.secret, {
//         expiresIn: '1d' //expires in one day
//       });
//       page.save((err, newPage) => { done(); });
//     });
//
//
//     it('should delete guide', (done) => {
//
//       chai.request(server)
//       .delete('/page/' + page.id + "/guide/" + page["guide"].guide[0].id + "?token=" + token)
//       .end((err, res) => {
//         res.should.have.status(200);
//         res.body.should.be.a('object');
//         res.body.gallery.rooms.should.be.a('array').length(0);
//         done();
//       });
//     });
//   });
//
//   describe('/DELETE room to roomID', () => {
//     //AUTHENTICATION WAS NOT INCLUDED SINCE TESTED IN POST
//     let page;
//     let token;
//     beforeEach((done) => { //Before each test we empty the database
//       page = new Page({
//         "name": "test",
//         "password": "password"
//       });
//       room = new Room();
//
//       token = jwt.sign({userID: page.userID}, configure.secret, {
//         expiresIn: '1d' //expires in one day
//       });
//
//       room.save((err, newRoom) => {
//         page.gallery.rooms.push(newRoom._id);
//         page.save((err, newPage) => { done(); });
//       });
//     });
//
//
//     it('should delete guide', (done) => {
//
//       chai.request(server)
//       .delete('/page/' + page.id + "/room/" + room.id + "?token=" + token)
//       .end((err, res) => {
//         res.should.have.status(200);
//         res.body.should.be.a('object');
//         res.body.gallery.rooms.should.be.a('array').length(0);
//         done();
//       });
//     });
//   });
// });
