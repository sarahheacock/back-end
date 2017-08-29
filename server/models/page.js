const bcrypt = require('bcrypt');
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const messages = require('../../data/data').messages;
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
  "local-guide": {
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

PageSchema.pre('save', (next) => {
  let page = this;
  if(page.gallery !== undefined){
    if(page.gallery.rooms !== undefined) page.gallery.rooms.sort(sortRooms);
    if(page.localGuide.guide !== undefined) page.localGuide.guide.sort(sortLocalGuide);
  }
  next();
});

// PageSchema.post('update', (err, res, next) => {
//   if(err) next(err);
//   Room.find({}).exec((err, rooms) => {
//
//   });
// });

PageSchema.methods.updateRooms = function(callback){
  Room.find({}).exec((err, rooms) => {

    if(err) callback(err, null);
    if(!this.gallery) this.gallery = {
      "rooms": [],
      "p1": "Hello!",
      "b": "We are excited to have you!",
      "title": "Welcome to our bed and breakfast..."
    };
    // if(!this.gallery.rooms) this.gallery.rooms = [];

    this.gallery.rooms = rooms.map((room) => { return room._id; });
    this.save(callback);
    // this.markModified('gallery');
    // console.log(this);
    // next();
  });
};

// RoomSchema.pre('save', (doc) => {
//   Page.find({}).exec((err, pages) => {
//     pages.forEach((page) => {
//       page.gallery.rooms.push(doc);
//
//     });
//   });
// });
// RoomSchema.post('remove', (doc) => {
//   Page.find({}).exec((err, page) => {
//     if(err) console.log(err);
//     const index = page.gallery.rooms.indexOf(doc._id);
//     page.gallery.rooms.splice(index, 1);
//
//     page.save((err, newPage) => {
//
//     });
//   })
// });
//
// RoomSchema.post('init', (doc) => {
//
// });

const ReservationSchema = new Schema({
  start: Number,
  end: Number,
  guests: Number,
  roomID: { type: Schema.Types.ObjectId, ref: 'Room' },
  userID: { type: Schema.Types.ObjectId, ref: 'User' },
  paid: {type:String, default:''},
  checkedIn: Date,
  notes: '',
  cost: Number,
  createdAt: {type:Date, default:Date.now},
});

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
