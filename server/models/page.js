const bcrypt = require('bcrypt');
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const messages = require('../../data/data').messages;
const root = require('../configure/config').root;


const sortRooms = function(a, b){
  return b.cost - a.cost;
};

const sortLocalGuide = function(a, b){
  if(b.categorty === a.category) return a.title - b.title;
  return b.category - a.category;
};

const makeid = () => {
  let text = "";
  const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for( let i=0; i < 16; i++ )
      text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
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
  root: {
    type: String,
    default: root
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
    rooms: {type: [RoomSchema], default: [RoomSchema]}
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

PageSchema.pre('save', function(next) {
  let page = this;
  if(page.rooms !== undefined) page.rooms.sort(sortRooms);
  if(page.localGuide !== undefined) page.localGuide.sort(sortLocalGuide);
  next();
});

const Page = mongoose.model("Page", PageSchema);
module.exports.Page = Page;
