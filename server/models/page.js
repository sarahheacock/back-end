const bcrypt = require('bcrypt');
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const messages = require('../../data/data').messages;
const CryptoJS = require('crypto-js');
// const root = require('../configure/config').root;

const addressData = require('../../data/data').addressData;
const defaultBilling = (Object.keys(addressData)).map((k) => addressData[k]["default"]).join('/');

const paymentData = require('../../data/data').paymentData;
const defaultPayment = (Object.keys(paymentData)).map((k) => paymentData[k]["default"]).join('/');



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
    type: String
  },
  cart: {
    type: Array,
    default: []
  },
  pageID: Schema.Types.ObjectId
});

UserSchema.pre('save', function(next){
  let user = this;

  if(!this.userID) this.userID = makeid();
  if(!this.cart) this.cart = []; //update cart
  if(!this.credit || this.credit === defaultPayment){
    this.credit = CryptoJS.AES.encrypt(defaultPayment, this.userID);
  }
  // else if(!CryptoJS.AES.decrypt(this.credit.toString(), this.userID).toString(CryptoJS.enc.Utf8)){
  //   this.credit = CryptoJS.AES.encrypt(this.credit, this.userID);
  // }

  if(this.cart.length > 0){
    let newCart = [];
    //let i = 0;
    const limit = new Date().setUTCHours(12, 0, 0, 0);

    user.cart.forEach((b, i) => {
      const start = new Date(b.start).setUTCHours(12, 0, 0, 0);
      const end = new Date(b.end).setUTCHours(11, 59, 0, 0);

      if(start < limit && i >= user.cart.length - 1){
        user.cart = newCart; //if the start time is current
        next();
      }
      else if(start >= limit){
        Reservation.find({
          $and: [
            {$or:[
              {"start": {$gt: start-1, $lt: end+1}},
              {"end": {$gt: start-1, $lt: end+1}},
              {"end": {$lt: start+1}, "start": {$gt: end-1}}
            ]},
            {roomID: b.roomID}
          ]
        }).exec((err, reservation) => {
          if(err) next(err);
          const reserved = newCart.reduce((c, d) => {
            const inRange = ((d.start >= start && b.start <= end) || (d.end >= start && d.end <= end) || (d.start <= start && d.end >= end));
            if(inRange) c + 1;
            return c;
          }, 0) + reservation.length;

          Room.findById(b.roomID, {available: 1}).exec((err, room) => {
            if(reserved < room["available"]){
              newCart.push({
                start: start,
                end: end,
                roomID: b.roomID,
                cost: b.cost,
                guests: b.guests
              });
            }
            //i++;
            if(i >= user.cart.length - 1){
              user.cart = newCart;
              next();
              //console.log(user.cart);
              //user.save(callback);
            }
          });
        });
      }
    });
  }
  else {
    next();
  }
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


const sortRooms = function(a, b){
  return b.cost - a.cost;
};

const sortLocalGuide = function(a, b){
  if(b.categorty === a.category) return a.title - b.title;
  return b.category - a.category;
};


const LocalGuideSchema = new Schema({
  title: {type:String, default:"Title"},
  p1: {type: String, default:"Plaid live-edge yr, meh put a bird on it enamel pin godard cornhole drinking vinegar banh mi flannel pug. Art party fixie lo-fi shabby chic forage. Meh craft beer blog, chicharrones small batch knausgaard flexitarian ugh banh mi. Occupy tattooed franzen, actually unicorn umami synth. Tacos godard kickstarter shaman cred pour-over. Offal pickled trust fund beard letterpress asymmetrical post-ironic jean shorts. Ethical shabby chic vape deep v vice woke af."},
  address: {type:String, default: "1640 Gateway Road, Portland, Oregon 97232"},
  link: {type:String, default: "#"},
  image: {type: String, default:"Tile-Dark-Grey-Smaller-White-97_pxf5ux"},
  category: {type: String, default: "Restaurants & Coffee Shops"}
});

const RoomSchema = new Schema({
  image: {type: String, default: "Tile-Dark-Grey-Smaller-White-97_pxf5ux"},
  carousel: {type: Array, default: ["Tile-Dark-Grey-Smaller-White-97_pxf5ux"]},
  p1: {type: String, default: "Semiotics pinterest DIY beard, cold-pressed kombucha vape meh flexitarian YOLO cronut subway tile gastropub. Trust fund 90's small batch, skateboard cornhole deep v actually before they sold out thundercats XOXO celiac meditation lomo hexagon tofu. Skateboard air plant narwhal, everyday carry waistcoat pop-up pinterest kitsch. Man bun vape banh mi, palo santo kinfolk sustainable selfies pug meditation kale chips organic PBR&B vegan pok pok. Lomo flexitarian viral yr man braid vexillologist. Bushwick williamsburg bicycle rights, sriracha succulents godard single-origin coffee fam activated charcoal."},
  b: {type: String, default: "Venmo 8-bit chambray thundercats. Jianbing drinking vinegar vinyl brunch, blog pop-up flexitarian plaid ramps quinoa food truck pok pok man bun taxidermy. "},
  title: {type: String, default: "Title"},
  available: {type: Number, default: 1},
  "maximum-occupancy": {type: Number, default: 2},
  cost: {type: Number, default: 150}
})



const PageSchema = new Schema({
  name: {
    type: String,
    unique: true,
    required: true,
    trim: true
  },
  password: {
    type: String
  },
  userID: {
    type: String,
    default: makeid()
  },
  home: {
    type: Object,
    default: {
      image: "pexels-photo_orp8gu",
      title: "Welcome to our bed and breakfast...",
      p1: "We are excited to have you!"
    }
  },
  gallery: {
    title: {type: String, default: "Welcome to our bed and breakfast..."},
    b: {type: String, default: "We are excited to have you!"},
    p1: {type: String, default: "We are excited to have you!"},
    rooms: [{ type: Schema.Types.ObjectId, ref: 'Room' }],
  },
  guide: {
    title: {type: String, default: "Welcome to our bed and breakfast..."},
    b: {type: String, default: "We are excited to have you!"},
    p1: {type: String, default: "We are excited to have you!"},
    guide: {type: [LocalGuideSchema], default: [LocalGuideSchema]}
  }
});

// authenticate input against database documents
PageSchema.statics.authenticate = (username, password, callback) => {
  Page.findOne({ name: username })
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

PageSchema.pre('save', function(next){
  let page = this;
  if(page.gallery !== undefined){
    if(page.gallery.rooms !== undefined) page.gallery.rooms.sort(sortRooms);
    // if(page.localGuide.guide !== undefined) page.localGuide.guide.sort(sortLocalGuide);
  }
  next();
});


PageSchema.methods.updateRooms = function(callback){
  let page = this;
  Room.find({}).exec((err, rooms) => {

    if(err) callback(err, null);
    if(!page.gallery) page.gallery = {
      "rooms": [],
      "p1": "Hello!",
      "b": "We are excited to have you!",
      "title": "Welcome to our bed and breakfast..."
    };

    page.gallery.rooms = rooms.map((room) => { return room._id; });

    page.save((err, doc) => {
      Page.findById(doc._id, {"_id": 0, userID: 0, password: 0, name: 0}).populate({
        path: 'gallery.rooms',
        model: 'Room'
      }).exec(callback);
    });
  });
};


const ReservationSchema = new Schema({
  start: {type: Number, required: true},
  end: {type: Number, required: true},
  guests: {type: Number, required: true},
  roomID: { type: Schema.Types.ObjectId, ref: 'Room', required: true },
  userID: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  paid: {type:String, default:''},
  checkedIn: {type:Boolean, default:false},
  charged: {type:Boolean, default:false},
  reminded: {type:Boolean, default:false},
  notes: {type:String, default:''},
  cost: {type: Number, required: true},
  createdAt: {type:Date, default:Date.now},
});

ReservationSchema.pre('save', function(next){
  let reservation = this;
  const min = new Date().getTime() - (48*60*60*1000);
  Reservation.remove({
    end: {$lt: min}
  }).exec((err, doc) => {
    const start = parseInt(reservation.start);
    const end = parseInt(reservation.end);

    reservation.start = (start < end) ? new Date(start).setUTCHours(12, 0, 0, 0) : new Date(end).setUTCHours(12, 0, 0, 0);
    reservation.end = (end > start) ? new Date(end).setUTCHours(11, 59, 0, 0) : new Date(start).setUTCHours(11, 59, 0, 0);
    //reservation.userID = req.params.userID;
    next();
  });
});

ReservationSchema.statics.findMonth = (month, year, callback) => {
  const date = new Date(month + "-01-" + year).getTime();
  const min = date - (7*24*60*60*1000);
  const max = date + (37*24*60*60*1000);

  Reservation.find({
    $or:[
      {"start": {$gt: min, $lt: max}},
      {"end": {$gt: min, $lt: max}}
    ]
  }).populate({
    path: 'roomID',
    model: 'Room',
    select: 'image title'
  }).populate({
    path: 'userID',
    model: 'User',
    select: 'email credit billing userID'
  }).exec(callback);
};

const Page = mongoose.model("Page", PageSchema);
const Room = mongoose.model("Room", RoomSchema);
const User = mongoose.model("User", UserSchema);
const Reservation = mongoose.model("Reservation", ReservationSchema);

module.exports = {
  Page: Page,
  User: User,
  Room: Room,
  Reservation: Reservation
};
