//During the test the env variable is set to test
process.env.NODE_ENV = 'test';

const mongoose = require("mongoose");
const messages = require("../data/data").messages;

const Reservation = require('../server/models/reservation').Reservation;
const Node = require('../server/models/reservation').Node;
const User = require('../server/models/user').User;
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
    Node.remove({}, (err) => { done(); });
  });

  describe('/GET reservation by user _id', () => {
    it("should get reservation if user signed in and user has reservations", (done) => {});
    it("should return 'no reservations' if user signed in and has no reservations", (done) => {});
    it("should return expiration message, logout, and create sign in form if user not signed in", (done) => {});
  });

  describe('/GET reservation by date', () => {
    it("should get reservation if admin signed in and hotel has reservations for date", (done) => {});
    it("should return 'no reservations' if admin signed in but no reservations", (done) => {});
    it("should return expiration message, logout, and create sign in form if admin not signed in", (done) => {});
  });

  describe('/GET reservation by month', () => {
    it("should get reservation if admin signed in and hotel has reservations for month", (done) => {});
    it("should return 'no reservations' if admin signed in but no reservations for given month", (done) => {});
    it("should return expiration message, logout, and create sign in form if admin not signed in", (done) => {});
  });

  describe('/POST reservation by user', () => {
    it("should post reservation, create proper nodes, charge, and send email client when user is signed in", (done) => {});
    it("should return message, if card info wrong", (done) => {});
    it("should return expiration message and logout if user not signed in", (done) => {});
  });

  describe('/POST reservation by admin', () => {
    it("should post reservation and create proper nodes, charge client, and send email when user is signed in", (done) => {});
    it("should return warning, if card info wrong or not there", (done) => {});
    it("should continue with reservation if admin confirms", (done) => {});
    it("should return expiration message and logout if user not signed in", (done) => {});
  });

  describe("/DELETE admin delete reservation and update parent's children", () => {
    it("should delete reservation if user is signed in and refund if 5 days away", (done) => {});
    it("should delete reservation if user is signed in and refund if 3 days away", (done) => {});
    it("should send warning message if user is signed in and refund if 2 days away", (done) => {});
    it("should delete reservation if user signed in, warning confirmed, and give partial refund", (done) => {});
    it("should return expiration message and logout if admin not signed in", (done) => {});
  });

  // describe("/DELETE admin delete reservation and update parent's children", () => {});
});
