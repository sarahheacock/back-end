var blogID = '598ce0f116ae3456118d1ca1';
var cloudName = "dhd1eov8v";
var links = ["home", "gallery", "local-guide", "book"];


//========INITIAL DATA=========================

// var data = {
//   "home": {},
//   "gallery": {},
//   "local-guide": {},
//   "book": {}
// };

var initialUser = {
  token: '',
  _id: '',
  name: '',
  email: '',
  billing: '',
  credit: ''
};

var initialEdit = {
  url: '',
  modalTitle: '',
  dataObj: {}
};

var initialMessage = '';

//===============FORMS============================
var notRequired = ['p1', 'b', 'link', "Address Line 2"];

var loginData = {
  username: {
    type: 'text',
    placeholder: 'Admin Username',
    componentClass: 'input',
    default: ''
  },
  password: {
    type: 'password',
    placeholder: 'Password',
    componentClass: 'input',
    default: ''
  },
  admin: {
    type: 'other',
    placeholder: 'Admin',
    componentClass: 'checkbox',
    default: false
  }
};

var signUpData = {
  name: {
    type: 'text',
    placeholder: 'Full Name',
    componentClass: 'input',
    default: ''
  },
  email: {
    type: 'text',
    placeholder: 'Email',
    componentClass: 'input',
    default: ''
  },
  password: {
    type: 'password',
    placeholder: 'Password',
    componentClass: 'input',
    default: ''
  },
  "Verify Password": {
    type: 'password',
    placeholder: 'Verify Password',
    componentClass: 'input',
    default: ''
  }
};

var addressData = {
  "Address Line 1": {
    type: 'text',
    placeholder: 'Street Address',
    componentClass: 'input',
    default: ''
  },
  "Address Line 2": {
    type: 'text',
    placeholder: 'Street Address',
    componentClass: 'input',
    default: ''
  },
  city: {
    type: 'text',
    placeholder: 'City',
    componentClass: 'input',
    default: ''
  },
  state: {
    type: 'text',
    placeholder: 'State',
    componentClass: 'input',
    default: ''
  },
  zip: {
    type: 'text',
    placeholder: 'Zip Code',
    componentClass: 'input',
    default: ''
  },
  country: {
    type: 'other',
    componentClass: 'select',
    default: 'United States'
  },
  phone: {
    type: 'text',
    placeholder: 'Zip Code',
    componentClass: 'input',
    default: ''
  },
};

var currentYear = new Date().getFullYear().toString();
var paymentData = {
	name: {
    type: 'text',
    placeholder: 'Name on Card',
    componentClass: 'input',
    default: ''
  },
  number: {
    type: 'text',
    placeholder: 'Number on Card',
    componentClass: 'input',
    default: ''
  },
  "Expiration Month": {
    type: 'other',
    componentClass: 'select',
    default: 'Jan 01'
  },
  "Expiration Year": {
    type: 'other',
    componentClass: 'select',
    default: currentYear,
  },
  "CVV": {
    type: 'text',
    placeholder: 'CVV',
    componentClass: 'input',
    default: ''
  }
};


var messageData = {
  name: {
    type: 'text',
    placeholder: 'Your Name',
    componentClass: 'input'
  },
  email: {
    type: 'email',
    placeholder: 'Email Address',
    componentClass: 'input'
  },
  phone: {
    type: 'text',
    placeholder: 'Phone Number',
    componentClass: 'input'
  },
  message: {
    type: 'text',
    placeholder: 'Message',
    componentClass: 'textarea'
  }
};

var galleryData = {
  "title": {
    type: 'text',
    placeholder: "Room's name",
    componentClass: 'input',
    default: ''
  },
  "b": {
    type: 'text',
    placeholder: "Bold text",
    componentClass: 'input',
    default: ''
  },
  "p1": {
    type: 'text',
    placeholder: 'Paragraph text',
    componentClass: 'textarea',
    default: ''
  },
  "cost": {
    type: 'text',
    placeholder: 'Cost of room per night',
    componentClass: 'input',
    default: ''
  },
  "maximum-occupancy": {
    type: 'text',
    placeholder: "Room's maximum occupancy",
    componentClass: 'input',
    default: ''
  },
  "available": {
    type: 'text',
    placeholder: "Number of rooms",
    componentClass: 'input',
    default: ''
  },
  "carousel": {
    type: 'other',
    placeholder: 'Admin',
    componentClass: 'imageUpload',
    default: ['Tile-Dark-Grey-Smaller-White-97_pxf5ux']
  },
  "image": {
    type: 'other',
    placeholder: 'Primary Image',
    componentClass: 'radio',
    default: ''
  }
}

var localGuideData = {
  "title": {
    type: 'text',
    placeholder: "Name of place",
    componentClass: 'input',
    default: ''
  },
  "category": {
    type: 'text',
    placeholder: "Category",
    componentClass: 'input',
    default: ''
  },
  "address": {
    type: 'text',
    placeholder: "Street Address",
    componentClass: 'input',
    default: ''
  },
  "link": {
    type: 'text',
    placeholder: "Link to yelp",
    componentClass: 'input',
    default: ''
  },
  "p1": {
    type: 'text',
    placeholder: 'Paragraph text',
    componentClass: 'textarea',
    default: ''
  },
  "image": {
    type: 'other',
    placeholder: 'Primary Image',
    componentClass: 'imageUpload',
    default: 'Tile-Dark-Grey-Smaller-White-97_pxf5ux'
  }
}

var editData = {
  "title": {
    type: 'text',
    placeholder: "Cursive Script",
    componentClass: 'input',
    default: ''
  },
  "b": {
    type: 'text',
    placeholder: "Bold text",
    componentClass: 'input',
    default: ''
  },
  p1: {
    type: 'text',
    placeholder: 'Write your paragraph here...',
    componentClass: 'textarea'
  }
};


var messages = {
  inputError: "*Fill out required fields.",
  tokenError: 'You are unauthorized. Sign in to continue.',
  expError: 'Session expired. Log back in to continue.',
  phoneError: "Invalid phone number.",
  emailError: "Invalid email address.",
  passwordError: "Passwords must match.",
  authError: "You are not authorized to access this account.",
  usernameError: 'Username not found.',
  passError: 'Incorrect password for given username.',
  messageSent: "Message sent! I will get back to you within 24 business hours. Thank you!",

  creditExpError: "Invalid expiration date.",
  creditNumError: "Invalid credit card number.",
  cvvError: "Invalid CVV number. Look for the 3 or 4 digits on the back of the card."
};

module.exports = {
  blogID: blogID,
  cloudName: cloudName,
  links: links,

  initialUser: initialUser,
  initialEdit: initialEdit,
  initialMessage: initialMessage,

  notRequired: notRequired,
  loginData: loginData,
  signUpData: signUpData,
  messageData: messageData,
  galleryData: galleryData,
  localGuideData: localGuideData,
  editData: editData,
  addressData: addressData,
  paymentData: paymentData,

  messages: messages
}
