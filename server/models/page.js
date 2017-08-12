const bcrypt = require('bcrypt');
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const messages = require('../../data/data').messages;



const makeid = () => {
  let text = "";
  const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for( let i=0; i < 16; i++ )
      text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
};


const RateSchema = new Schema({
  cost: {type: String, default: "0"},
  time: {type: String, default: "10 minutes"},
  title: {type: String, default: "Pampered Paws"},
  description: {type: String, default: "Good for..."},
});


const PageSchema = new Schema({
  username: {
    type: String,
    unique: true,
    required: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  userID: {
    type: String,
    default: makeid()
  },
  home: {
    type: Object,
    default: {
      image: "Pat_ltplrl.png",
      p1: "I have a deep love for animals..."
    }
  },
  services: {
    type: Object,
    default: {
      "Pet Services Provided": {
        "Pet Sitting": "fa fa-paw",
        "Dog Walking": "fi-guide-dog large-icon",
        "Care & feeding": "fa fa-heart",
        "Waste pick up & disposal": "fi-trash",
        "Medication administration": "fa fa-medkit",
        "Brushing & Bathing": "fa fa-bath",
        "Transportation": "fa fa-car",
        "House sitting": "fa fa-home"
      },
      "Other Services if on Vacation": {
        "Collect mail": "fa fa-envelope-o",
        "Water plants": "fa fa-leaf",
        "Alter lights & shades": "fa fa-lightbulb-o"
      },
      "Areas Serviced": ["Norwest Columbus including zip codes:", "43235, 43017, 43016, 43002, 43220, 43085, 43221, 43214"]
    }
  },
  rates: {
    p1: {type: String, default: "Initial visit..."},
    rate: {type: [RateSchema], default: [RateSchema]}
  },
  contact: {
    type: Object,
    default: {
      p1: "Would love to hear from you!",
      p2: ["Call me with the provided phone numbers or click on a", "fa fa-envelope", "icon to leave a message and I will get back to you as soon as possible.", "Note: No spam or soliciting, please  :-)"]
    }
  },
  footer: {
    type: Object,
    default: {
      p1: "Member of...",
      p2: ["614-625-7651", "614-754-8654"]
    }
  }
});

// authenticate input against database documents
PageSchema.statics.authenticate = (username, password, callback) => {
  Page.findOne({ username: username })
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



const Page = mongoose.model("Page", PageSchema);

module.exports.Page = Page;
