const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const Schema = mongoose.Schema;

const addressData = require('../../data/data').addressData;
const defaultBilling = (Object.keys(addressData)).map((k) => addressData[k]["default"]).join('/');

const paymentData = require('../../data/data').paymentData;
const defaultPayment = (Object.keys(paymentData)).map((k) => paymentData[k]["default"]).join('/');

const messages = require('../../data/data').messages;


const makeid = () => {
    let text = "";
    const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( let i=0; i < 16; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}


const UserSchema = new Schema({
  name: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    unique: true,
    trim: true
  },
  password: {
    type: String,
    trim: true
  },
  billing: {
    type: String,
    trim: true,
    default: defaultBilling
  },
  credit: {
    type: String,
    trim: true,
    default: defaultPayment
  },
  userID: {
    type: String,
    default: makeid
  },
  pageID: Schema.Types.ObjectId
});



// authenticate input against database documents
UserSchema.statics.authenticate = (username, password, callback) => {
  User.findOne({ email: username })
    .exec((error, user) => {
      if (error) {
        return callback(error);
      }
      else if (!user) {
        return callback(messages.usernameError);
      }
      bcrypt.compare(password, user.password , (error, result) => {
        if (result === true){
          return callback(null, user);
        }
        else {
          return callback(messages.passError);
        }
      })
    });
}


const User = mongoose.model("User", UserSchema);

module.exports = {
  User: User
};
