const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const Schema = mongoose.Schema;
const async = require("async");
const each = require("async/each");
const rootOne = require('../configure/config').rootOne;


// const clean = (branch) => {
//
// }

const ReservationSchema = new Schema({
  start: Number,
  end: Number,
  // event: {
    guests: Number,
    roomID: String,
    userID: String,
    paid: {type:String, default:''},
    checkedIn: Date,
    notes: '',
    cost: Number,
    createdAt: {type:Date, default:Date.now},
  // },
});

// ReservationSchema.index({ userID: 1, type: -1 });


const TreeOneSchema = new Schema({ //super straight forward hash
  date: {
    type: Object,
    default: {}
  },
  user: {
    type: Object,
    default: {}
  }
}, { minimize: false });

// TreeOneSchema.methods.clean = function(callback){
//   const currentYear = new Date().getFullYear();
//   const currentMonth = new Date().getMonth();
//   let branch = Object.assign({}, this)._doc;
//   console.log("this", branch);
//
//
//   (Object.keys(branch.date)).forEach((year) => {
//     if(Object.keys(this.date[year]).length === 0) delete this.date[year];
//     // console.log("year", year);
//     const thisYear = parseInt(year);
//     if(thisYear <= currentYear){
//       (Object.keys(branch.date[year])).forEach((month) => { //iterate through months for year
//         const thisMonth = parseInt(month);
//         console.log("month", year, month);
//         if(thisYear < currentYear || thisMonth < currentMonth){
//           // console.log(year, month);
//
//           (Object.keys(branch.date[year][month])).forEach((date) => { //iterate through dates for month
//             (branch.date[year][month][date]).forEach((identity, i) => { //iterate through each id
//               const id = identity.toString();
//               Reservation.findById(id, (err, doc) => {
//                 if(doc){
//                   const user = (doc.event.userID) ? doc.event.userID : '';
//
//                   doc.remove((err) => {
//                     if(err) console.log(err);
//
//                     const start = this.date[year][month][date].indexOf(id);
//                     console.log("start", start);
//                     this.date[year][month][date].splice(start, 1);
//
//                     if(this.date[year][month][date].length === 0) delete this.date[year][month][date];
//                     if(Object.keys(this.date[year][month]).length === 0) delete this.date[year][month];
//                     if(Object.keys(this.date[year]).length === 0) delete this.date[year];
//
//
//                     if(user){
//                       const last = user.charAt(user.length - 1).toString();
//                       if(this.user[last][user]){
//                         console.log("last", last);
//                         console.log("user", this.user[last][user]);
//                         console.log("id", id);
//
//                         const startIndex = this.user[last][user].indexOf(mongoose.Types.ObjectId(id));
//                         console.log("startIndex", startIndex);
//                         // console.log("startIndex", startIndex);
//                         this.user[last][user].splice(startIndex, 1);
//                         if(this.user[last][user].length === 0) delete this.user[last][user];
//                         console.log("user-branch", JSON.stringify(this, null, 4));
//                       }
//                     }
//
//                     console.log("branch", JSON.stringify(this, null, 4));
//
//                   });
//                 }
//               });
//             });
//           });
//         }
//         // else {
//         //
//         // }
//       });
//     }
//   });
//   this.markModified('date');
//   this.markModified('user');
//   return this.save(callback);
//
// };
//
// ReservationSchema.post("save", (doc) => {
//   let arr = [];
//   let user = '';
//
//   let start = doc.start;
//   if(doc.event.userID){
//     user = doc.event.userID;
//   }
//   while(start <= doc.end){
//     arr.push(start.toString());
//     start += (24*60*60*1000);
//   }
//
//   TreeOne.findById(rootOne, (err, branch) => {
//     let i = 0;
//
//     //get rid of old reservations
//     // clean(branch);
//
//     async.each(arr, (id) => {
//       const month = new Date(parseInt(id)).getMonth().toString();
//       const year = new Date(parseInt(id)).getFullYear().toString();
//
//       if(!branch.date[year]){ //if year exists
//         branch.date[year] = {};
//         for(let i = 0; i < 12; i++) branch.date[year][i.toString()] = {};
//       }
//
//       branch.date[year][month][id] = (branch.date[year][month][id]) ? branch.date[year][month][id].concat([doc._id]) : [doc._id];
//       i++;
//
//       if(i === arr.length){
//         branch.markModified('date');
//         // branch.markModified('user');
//         branch.save((err, newBranch) => {
//           if(user){
//             const last = user.charAt(user.length - 1).toString();
//             newBranch.user[last][user] = (newBranch.user[last][user]) ? newBranch.user[last][user].concat([doc._id]) : [doc._id];
//
//             newBranch.markModified('user');
//             newBranch.save((err, b) => {
//               // console.log("b", b);
//               b.clean((err, branch) => {
//                 console.log("end", branch);
//                 return;
//               });
//             });
//           }
//           // console.log("newBranch", newBranch);
//           newBranch.clean((err, branch) => {
//             console.log("end", branch);
//             return;
//           });
//         });
//       }
//     });
//
//   });
//
// });

const Reservation = mongoose.model("Reservation", ReservationSchema);
const TreeOne = mongoose.model("TreeOne", TreeOneSchema);

// module.exports = {
//   Reservation: Reservation,
//   TreeOne: TreeOne,
// };


// const NodeSchema = new Schema({
//   reservation: {
//     type: Object
// 	},
//   parent: {
//     type: Array,
//     default: []
// 	},
//   children: {
//     type: Object,
//     default: {}
// 	}
// }, { minimize: false });

// const split = (i, arr) => {
//   let newObj = {};
//   arr.forEach((idString, index) => { //iterate through each idString
//     const newLetter = idString.charAt(i);
//     if(newObj[newLetter] && newLetter !== '') newObj[newLetter].push(idString);
//     else if(newLetter !== '') newObj[newLetter] = [idString];
//   });
//   return newObj;
// };
//
// const build = (i, obj, resID) => { //char index, { nodeID: { '0': [...] } }, id of new reservation
//   let newObj = {};
//
//   const length = (Object.keys(obj)).reduce((a, b) => {
//     return a + Object.keys(obj[b]).reduce((c, d) => {
//       if(i < obj[b][d][0].length - 1) return c + 1; //arr should have strings of all the same length
//       else return c;
//     }, 0);
//   }, 0);
//
//   console.log("obj", JSON.stringify(obj, null, 4));
//   console.log("length", length);
//
//   async.each(Object.keys(obj), (id) => { //iterate through each nodeID
//     Node.findById(id).exec((err, node) => {
//
//       async.each(Object.keys(obj[id]), (letter) => { //do each letter at the same time
//         if(i > 20) return;
//         let done = (i >= obj[id][letter][0].length - 1);
//         console.log('done', done);
//
//         const newChildren = (!done) ? split(i + 1, obj[id][letter]) : {};
//
//         if(done){
          // let Obj = {};
          // if(node.reservation){
          //   if(node.reservation[letter]) Obj[letter] = [resID].concat(node.reservation[letter]);
          //   else Obj[letter] = [resID];
          // }
          // else {
          //   Obj[letter] = [resID];
          // }
          //
          // node.reservation = Object.assign({}, Obj);
          // // console.log("node.reservation", node.reservation);
          // node.save((err, u) => { return; });
//         }
//         else {
//           if(!node.children[letter]){ //if child with that letter does not already exist
//             let upcoming = new Node();
//             upcoming.parent.push(node._id);
//
//             upcoming.save((err, up) => {
//               let obj = {};
//               obj[letter] = up._id;
//               node.children = Object.assign(obj, node.children);
//               node.save((err, u) => {
//                 let thisChild = {};
//                 thisChild[up._id] = newChildren;
//                 newObj = Object.assign(newObj, thisChild);
//                 if(Object.keys(newObj).length === length) return build(i+1, newObj, resID);
//               });
//             });
//           }
//           else {
//             Node.findById(node.children[letter], (err, u) => {
//               let thisChild = {};
//               thisChild[u._id] = newChildren;
//               newObj = Object.assign(newObj, thisChild);
//               if(Object.keys(newObj).length === length) return build(i+1, newObj, resID);
//             });
//           }
//         }
//       });
//
//     });
//   });
// };