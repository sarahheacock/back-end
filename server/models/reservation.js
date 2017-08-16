const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const Schema = mongoose.Schema;


// const newArr = () => {
//   const b = new Array(10)
//   return b.map((a) => null);
// }

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

const UpcomingSchema = new Schema({
  reservation: {
    ref: 'Reservation',
    type: [ReservationSchema]
  },
  parent: {
    type: String,
    default: ''
  },
  children: [{
    type: String,
    default: ''
	}],
});


// UpcomingSchema.method("insertReservation", )

const Upcoming = mongoose.model("Upcoming", UpcomingSchema);

module.exports = {
  Upcoming: Upcoming
};
