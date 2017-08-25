const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const Schema = mongoose.Schema;
const async = require("async");
const each = require("async/each");
const root = require('../configure/config').root;


const split = (i, arr) => {
  let newObj = {};
  arr.forEach((idString, index) => { //iterate through each idString
    const newLetter = idString.charAt(i);
    if(newObj[newLetter] && newLetter !== '') newObj[newLetter].push(idString);
    else if(newLetter !== '') newObj[newLetter] = [idString];
  });
  return newObj;
};

const build = (i, obj, resID) => { //char index, { nodeID: { '0': [...] } }, id of new reservation
  let newObj = {};

  const length = (Object.keys(obj)).reduce((a, b) => {
    return a + Object.keys(obj[b]).reduce((c, d) => {
      if(i < obj[b][d][0].length - 1) return c + 1; //arr should have strings of all the same length
      else return c;
    }, 0);
  }, 0);

  console.log("obj", JSON.stringify(obj, null, 4));
  console.log("length", length);

  async.each(Object.keys(obj), (id) => { //iterate through each nodeID
    Node.findById(id, (err, node) => {

      async.each(Object.keys(obj[id]), (letter) => { //do each letter at the same time
        if(i > 20) return;
        let done = (i >= obj[id][letter][0].length - 1);
        console.log('done', done);

        const newChildren = (!done) ? split(i + 1, obj[id][letter]) : {};

        if(done){
          let Obj = {};
          if(node.reservation){
            if(node.reservation[letter]) Obj[letter] = [resID].concat(node.reservation[letter]);
            else Obj[letter] = [resID];
          }
          else {
            Obj[letter] = [resID];
          }

          node.reservation = Object.assign({}, Obj);
          // console.log("node.reservation", node.reservation);
          node.save((err, u) => { return; });
        }
        else {
          if(!node.children[letter]){ //if child with that letter does not already exist
            let upcoming = new Node();
            upcoming.parent.push(node._id);

            upcoming.save((err, up) => {
              let obj = {};
              obj[letter] = up._id;
              node.children = Object.assign(obj, node.children);
              node.save((err, u) => {
                let thisChild = {};
                thisChild[up._id] = newChildren;
                newObj = Object.assign(newObj, thisChild);
                if(Object.keys(newObj).length === length) return build(i+1, newObj, resID);
              });
            });
          }
          else {
            Node.findById(node.children[letter], (err, u) => {
              let thisChild = {};
              thisChild[u._id] = newChildren;
              newObj = Object.assign(newObj, thisChild);
              if(Object.keys(newObj).length === length) return build(i+1, newObj, resID);
            });
          }
        }
      });

    });
  });
};

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
  let obj = {};
  obj[root] = { '0': [] };

  let start = doc.start/100000;
  const end = doc.end/100000;

  if(doc.event.userID) obj[root]['1'] = ['1' + doc.event.userID];
  while(start <= end){
    obj[root]["0"].push("0" + start.toString());
    start += (24*6*6);
  }

  if(start > end) return build(0, obj, doc._id);
});

// UpcomingSchema.method("insertReservation", )
const Reservation = mongoose.model("Reservation", ReservationSchema);
const Node = mongoose.model("Node", NodeSchema);

module.exports = {
  Reservation: Reservation,
  Node: Node
};
