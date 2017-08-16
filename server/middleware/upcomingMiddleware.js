const Upcoming = require("../models/reservation").Upcoming;
const data = require('../../data/data');

const build = (i, idString, nodeID) => {
  const letter = idString.charAt(i);
  const num = (letter > '9') ? letter - 'a' + 10 : letter - '0';

  Upcoming.findById(nodeID, (err, node) => {
    if(node.children[num] === null || node.children[num] === undefined){
      let upcoming = new Upcoming();
      upcoming.children = new Array(16);
      upcoming.parent = node._id;

      upcoming.save((err, up) => {
        if(err) next(err);
        node.children.splice(num, 1, up._id);
        node.save((err, u) => {
          i++;
          if(i < idString.length) return build(i, idString, up._id);
          else return up._id;
        });
      });
    }
    else {
      Upcoming.findById(node.children[num], (err, u) => {
        if(err) return next(err);
        i++;
        if(i < idString.length) return build(i, idString, u._id);
        else return u._id;
      });
    }
  });
};

const create = (req, res, next) => {
  // console.log(req.params.upcomingID);
  const newRes = {
    userID: "0120"
  };
  const result = build(0, newRes.userID, req.params.upcomingID);
  // console.log("result", result);
  req.result = result;
  next();
};


module.exports = {
  create: create
};
