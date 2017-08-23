const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const Schema = mongoose.Schema;
const async = require("async");
const parallel = require("async/parallel");
const root = require('../configure/config').root;

const build = (i, idString, nodeID, resID) => { //char index, userID or date, id of newly created node, id of new reservation

  const letter = idString.charAt(i);
  const length = idString.length;
  // i++;

  Node.findById(nodeID, (err, node) => {
    //if nodeID is the same and letters are the same
    //if nodeID is the same and letters are different
    //if nodeID is different
    if(!node.children[letter]){
      let upcoming = new Node();
      upcoming.parent.push(node._id);

      upcoming.save((err, up) => {
        let obj = {};
        obj[letter] = up._id;
        node.children = Object.assign(obj, node.children);
        node.save((err, u) => { return build(i+1, idString, up._id, resID); });
      });
    }
    else if(node.children[letter]){
      Node.findById(node.children[letter], (err, u) => {
        return build(i+1, idString, u._id, resID);
      });
    }
  });
};

// if(!node.children[letter] && i === length){
//   let obj = {};
//   obj[letter] = resID;
//   node.reservation = Object.assign({}, obj, node.reservation);
//   node.save((err, u) => { return; });
// }
// else if(node.children[letter] && i === length){
//   return;
// }

const ReservationSchema = new Schema({
  start: Number,
  end: Number,
  event: {
    guests: Number,
    roomID: String,
    userID: String,
    paid: {type:String, default:''},
    checkedIn: Date,
    notes: '',
    cost: Number,
    createdAt: {type:Date, default:Date.now},
  },
});

const NodeSchema = new Schema({
  reservation: {
    type: Object
	},
  parent: {
    type: Array,
    default: []
	},
  children: {
    type: Object,
    default: {}
	}
}, { minimize: false });

ReservationSchema.post("save", (doc) => {
  let arr = [];
  arr.push(doc.event.userID);

  let start = doc.start;
  while(start <= doc.end){
    arr.push("0" + start.toString());
    start += (24*60*60*1000);
  }

  if(start > doc.end){
    console.log("arr", arr);
    return build(0, arr, root, doc._id);
    // const newArr = arr.
    // async.parallel([
    //     () => { return build(0, arr[0], root, doc._id); },
    //     () => { return build(0, arr[1], root, doc._id); }
    // ]);
  }
});

// UpcomingSchema.method("insertReservation", )
const Reservation = mongoose.model("Reservation", ReservationSchema);
const Node = mongoose.model("Node", NodeSchema);

module.exports = {
  Reservation: Reservation,
  Node: Node
};
