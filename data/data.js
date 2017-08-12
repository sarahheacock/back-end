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
  token: ''
};

var initialEdit = {
  url: '',
  modalTitle: '',
  dataObj: {}
};

var initialMessage = '';

//===============FORMS============================
var notRequired = ['description'];

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


// var messageData = {
//   name: {
//     type: 'text',
//     placeholder: 'Your Name',
//     componentClass: 'input'
//   },
//   email: {
//     type: 'email',
//     placeholder: 'Email Address',
//     componentClass: 'input'
//   },
//   phone: {
//     type: 'text',
//     placeholder: 'Phone Number',
//     componentClass: 'input'
//   },
//   message: {
//     type: 'text',
//     placeholder: 'Message',
//     componentClass: 'textarea'
//   }
// };


// var rateData = {
//   name: {
//     type: 'text',
//     placeholder: 'Name of Room',
//     componentClass: 'input'
//   },
//   cost: {
//     type: 'text',
//     placeholder: 'Cost of Service (US Dollars)',
//     componentClass: 'input'
//   },
//   time: {
//     type: 'text',
//     placeholder: 'Length of Service',
//     componentClass: 'input'
//   },
//   description: {
//     type: 'text',
//     placeholder: 'Description',
//     componentClass: 'input'
//   }
// };

// var editData = {
//   p1: {
//     type: 'text',
//     placeholder: 'Write your paragraph here...',
//     componentClass: 'textarea'
//   }
// };


var messages = {
  inputError: "*Fill out required fields.",
  tokenError: 'You are unauthorized. Sign in to continue.',
  expError: 'Session expired. Log back in to continue.',
  phoneError: "Invalid phone number.",
  emailError: "Invalid email address.",
  authError: "You are not authorized to access this account.",
  usernameError: 'Username not found.',
  passError: 'Incorrect password for given username.',
  messageSent: "Message sent! I will get back to you within 24 business hours. Thank you!"
};

module.exports = {
  blogID: blogID,
  cloudName: cloudName,
  links: links,

  // data: data,
  initialUser: initialUser,
  initialEdit: initialEdit,
  initialMessage: initialMessage,

  notRequired: notRequired,
  loginData: loginData,

  messages: messages
}
