//During the test the env variable is set to test
process.env.NODE_ENV = 'test';

const mongoose = require("mongoose");
const messages = require("../data/data").messages;
const Page = require('../server/models/page').Page;

//Require the dev-dependencies
const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../server/index');
const should = chai.should();

chai.use(chaiHttp);
//Our parent block
describe('Admin Login', () => {
  beforeEach((done) => { //Before each test we empty the database
    Page.remove({}, (err) => { done(); });
  });

  describe('/POST login', () => {
    const login = {
      "username": "test",
      "password": "password",
      "admin": true
    };

    const invalidForm = {
      "username": "test",
    };

    const invalidpage = {
      "username": "t",
      "password": "password",
      "admin": true
    };

    const invalidPassword = {
      "username": "test",
      "password": "pass",
      "admin": true
    };

    let page;
    beforeEach((done) => { //Before each test we empty the database
      page = new Page({
        "name": "test",
        "password": "password"
      });
      done();
    });

    // it('it should return message, edit, and user', (done) => {
    //   page.save((err, page) => {
    //     chai.request(server)
    //     .post('/login')
    //     .send(invalidForm)
    //     .end((err, res) => {
    //       res.body.should.be.a('object');
    //       res.body.should.have.property('user');
    //       res.body.should.have.property('message').eql('');
    //       res.body.should.have.property('edit');
    //       res.body.user.should.have.property('token');
    //       done();
    //     });
    //   });
    // });

    it('it should return fill out required fields', (done) => {
      page.save((err, page) => {
        chai.request(server)
        .post('/login')
        .send(invalidForm)
        .end((err, res) => {
          res.body.should.be.a('object');
          res.body.should.have.property('message').eql(messages.inputError);
          done();
        });
      });
    });

    it('it should return no page if not found', (done) => {
      page.save((err, page) => {
        chai.request(server)
        .post('/login')
        .send(invalidpage)
        .end((err, res) => {
          res.body.should.be.a('object');
          res.body.should.have.property('message').eql(messages.usernameError);
          done();
        });
      });
    });

    it('it should return invalid password if wrong', (done) => {
      page.save((err, page) => {
        chai.request(server)
        .post('/login')
        .send(invalidPassword)
        .end((err, res) => {
          res.body.should.be.a('object');
          res.body.should.have.property('message').eql(messages.passError);
          done();
        });
      });
    });
  });
});
