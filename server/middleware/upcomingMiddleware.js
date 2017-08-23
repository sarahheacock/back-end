const Upcoming = require("../models/reservation").Upcoming;
const data = require('../../data/data');



const create = (req, res, next) => {
  next();
};


module.exports = {
  create: create
};
