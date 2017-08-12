//During the test the env variable is set to test
process.env.NODE_ENV = 'test';

const mongoose = require("mongoose");
const messages = require("../data/data").messages;
// const Page = require('../server/models/page').Page;

//Require the dev-dependencies
const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../server/index');
const should = chai.should();

chai.use(chaiHttp);
//Our parent block
describe('User Login', () => {
  beforeEach((done) => { //Before each test we empty the database
    // Page.remove({}, (err) => { done(); });
  });

  describe('/POST login', () => {
    it('', (done) => {

    });
  });
});
