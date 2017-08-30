//During the test the env variable is set to test
process.env.NODE_ENV = 'test';

const mongoose = require("mongoose");
const messages = require("../data/data").messages;

const Reservation = require('../server/models/page').Reservation;
// const Node = require('../server/models/reservation').Node;
const User = require('../server/models/page').User;
const Page = require('../server/models/page').Page;

//Require the dev-dependencies
const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../server/index');
const should = chai.should();

chai.use(chaiHttp);
//Our parent block

describe('Reservation', () => {
  beforeEach((done) => {
    Reservation.remove({}, (err) => { done(); });
  });

  describe('/POST reservation by user', () => {
    it("should post reservation, create proper nodes, charge, and send email client when user is signed in", (done) => {});
    it("should return message if card info wrong", (done) => {});
    it("should return error if dates are invalid", (done) => {});
    it("should return expiration message and logout if user not signed in", (done) => {});
  });

});
