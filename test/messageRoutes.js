//During the test the env variable is set to test
process.env.NODE_ENV = 'test';

const mongoose = require("mongoose");
const messages = require("../data/data").messages;

//Require the dev-dependencies
const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../server/index');
const should = chai.should();

chai.use(chaiHttp);
//Our parent block
describe('Messages', () => {

  describe('/POST message', () => {
    const newMessage = {
      name: "Sarah",
      email: "sarah@gmail.com",
      phone: "555-555-5555",
      message: "hello"
    }

    const invalidForm = {
      name: "Sarah",
      email: "sarah@gmail.com",
      phone: "555-555-5555"
    };

    const invalidPhone = Object.assign({}, newMessage, {phone: "555-555-555"});
    const invalidEmail = Object.assign({}, newMessage, {email: "email"});

    it('it should send a success message', (done) => {
      chai.request(server)
      .post('/sayHello')
      .send(newMessage)
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('message').eql(messages.messageSent);
        done();
      });
    });

    it('it should send an error if not filled', (done) => {
      chai.request(server)
      .post('/sayHello')
      .send(invalidForm)
      .end((err, res) => {
        res.body.should.be.a('object');
        res.body.should.have.property('message').eql(messages.inputError);
        done();
      });
    });

    it('it should send an error if phone incorrect', (done) => {
      chai.request(server)
      .post('/sayHello')
      .send(invalidPhone)
      .end((err, res) => {
        res.body.should.be.a('object');
        res.body.should.have.property('message').eql(messages.phoneError);
        done();
      });
    });

    it('it should send an error if email incorrect', (done) => {
      chai.request(server)
      .post('/sayHello')
      .send(invalidEmail)
      .end((err, res) => {
        res.body.should.be.a('object');
        res.body.should.have.property('message').eql(messages.emailError);
        done();
      });
    });
  });
});
