const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const Schema = mongoose.Schema;


const ReservationSchema = new Schema({
  start: Number,
  end: Number,
  event: {
    guests: Number,
    roomID: Schema.Types.ObjectId,
    userID: Schema.Types.ObjectId,
    paid: {type:String, default:''},
    checkedIn: Date,
    notes: '',
    cost: Number,
    createdAt: {type:Date, default:Date.now},
  },
});

const NodeSchema = new Schema({
  reservation: [{
    type: Object,
    default: {}
	},
  parent: {
    type: Object,
    default: {}
	},
  children: {
    type: Object,
    default: {}
	}
});


// UpcomingSchema.method("insertReservation", )
const Reservation = mongoose.model("Reservation", ReservationSchema);
const Node = mongoose.model("Node", NodeSchema);

module.exports = {
  Reservation: Reservation,
  Node: Node
};
