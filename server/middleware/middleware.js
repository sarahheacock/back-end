const superSecret = require('../configure/config').secret;
const jwt = require('jsonwebtoken');

const data = require('../../data/data');
const messageData = data.messageData;
const editData = data.editData;
const galleryData = data.galleryData;
const localGuideData = data.localGuideData;
const loginData = data.loginData;
const signUpData = data.signUpData;
const addressData = data.addressData;
const paymentData = data.paymentData;
const notRequired = data.notRequired;
const messages = data.messages;


//============input functions==========================

const checkForm = (obj, form) => {
  return (Object.keys(form)).reduce((a, b) => {
    return a && ((obj[b] !== '' && obj[b] !== undefined && obj[b].length !== 0) || notRequired.includes(b));
  }, true);
};

const checkSize = (obj, form) => {
  return (Object.keys(obj)).reduce((a, b) => {
    return a && (form[b] !== undefined || b === "token");
  }, true);
}

const formatNum = (num) => {
  return num.split('').filter((n) => {
    const digit = parseInt(n);
    if(n !== NaN) return digit;
  }).join('');
};

const checkPhone = (newNum) => {
  //make sure num has <= 11 digits but >= 10 digits
  //10^9 = 100 000 0000
  //2 * 10^10 - 1 = 1 999 999 9999
  return newNum <= (2 * Math.pow(10, 10) - 1) && newNum >= Math.pow(10, 9);
};

const checkEmail = (mail) => {
  const re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(mail);
};

const checkDate = (month, year) => {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  const m = month.split(' ');
  const thisM = new Date().getMonth();
  const thisMonth = months[thisM];
  const thisYear = new Date().getFullYear().toString();
  // console.log(m, thisMonth, thisYear);

  //is expiration date later than this month;
  const minDate = new Date(thisMonth + " " + thisYear).getTime();
  const expDate = new Date(m[0] + " " + year).getTime();

  // console.log(minDate, expDate);
  return expDate > minDate;
}

const checkCVV = (cvv) => {
  return true;
}

const checkCredit = (num) => {
  return true;
}

//==========output========================================
const checkMessageInput = (req, res, next) => {

  const cForm = checkForm(req.body, messageData);

  if(!cForm){
    res.json({message: messages.inputError})
  }
  else {
    const phone = formatNum(req.body.phone)
    const cPhone = checkPhone(phone);
    const cEmail = checkEmail(req.body.email);
    const cSize = checkSize(req.body, messageData);

    if(!cPhone){
      res.json({message: messages.phoneError})
    }
    else if(!cEmail){
      res.json({message: messages.emailError});
    }
    else if(!cSize){
      let err = new Error("Invalid entry");
      err.status = 400;
      return next(err);
    }
    else {
      return next();
    }
  }

};

const checkRateInput = (req, res, next) => {

  const cForm = (req.params.section === "gallery") ? checkForm(req.body, galleryData) : checkForm(req.body, localGuideData);
  const cSize = (req.params.section === "gallery") ? checkSize(req.body, galleryData) : checkSize(req.body, localGuideData);

  if(!cForm){
    res.json({message: messages.inputError})
  }
  else if(!cSize){
    let err = new Error("Invalid entry");
    err.status = 400;
    return next(err);
  }
  else {
    return next();
  }
};

const checkEditInput = (req, res, next) => {

  const cForm = checkForm(req.body, editData);
  const cSize = checkSize(req.body, editData);

  if(!cForm){
    res.json({message: messages.inputError})
  }
  else if(!cSize){
    let err = new Error("Invalid entry");
    err.status = 400;
    return next(err);
  }
  else {
    return next();
  }
};


const checkLoginInput = (req, res, next) => {
  const cForm = checkForm(req.body, loginData);
  const cSize = checkSize(req.body, loginData);

  if(!cForm){
    res.json({message: messages.inputError})
  }
  else if(!cSize){
    let err = new Error("Invalid entry");
    err.status = 400;
    return next(err);
  }
  else {
    return next();
  }
};

const checkSignUpInput = (req, res, next) => {
  const cForm = checkForm(req.body, signUpData);
  const cSize = checkSize(req.body, signUpData);

  if(!cForm){
    res.json({message: messages.inputError})
  }
  else if(!cSize){
    let err = new Error("Invalid entry");
    err.status = 400;
    return next(err);
  }
  else {
    const cPass = req.body.password === req.body["Verify Password"];
    const cEmail = checkEmail(req.body.email);
    if(!cPass){
      res.json({message: messages.passwordError})
    }
    else if(!cEmail){
      res.json({message: messages.emailError});
    }
    else {
      return next();
    }
  }
}

const checkUserInput = (req, res, next) => {
  let cForm;
  let cSize;
  if(req.params.userInfo === "billing"){
    cForm = checkForm(req.body, addressData);
    cSize = checkSize(req.body, addressData);
  }
  else if(req.params.userInfo === "credit"){
    cForm = checkForm(req.body, paymentData);
    cSize = checkSize(req.body, paymentData);
  }
  else {
    req.newOutput = req.body[req.params.userInfo];
    next();
  }

  if(!cForm){
    res.json({message: messages.inputError})
  }
  else if(!cSize){
    let err = new Error("Invalid entry");
    err.status = 400;
    return next(err);
  }
  else {
    let message = '';
    if(req.body.phone){
      const phone = formatNum(req.body.phone);
      const cPhone = checkPhone(phone);
      if(!cPhone) message = messages.phoneError;
    }
    if(req.body["Expiration Month"]){
      const cDate = checkDate(req.body["Expiration Month"], req.body["Expiration Year"]);
      if(!cDate) message = messages.creditExpError;
    }
    if(req.body.CVV){
      const cvv = formatNum(req.body.CVV);
      const ccvv = checkCVV(cvv);
      if(!ccvv) message = messages.cvvError;
    }
    if(req.body.number){
      const num = formatNum(req.body.number);
      const cCredit = checkCredit(num);
      if(!cCredit) message = messages.creditNumError;
    }

    if(message){
      res.json({message: message})
    }
    else {
      let keys = Object.keys(req.body);
      keys.splice(keys.indexOf("token"), 1);
      req.newOutput = keys.map((k) => req.body[k]).join('/');
      next();
    }
  }
}

// verifies token after login
const authorizeUser = (req, res, next) => {
  // check header or url parameters or post parameters for token
  const token = req.body.token || req.query.token || req.headers['x-access-token'];
  if (token) { // decode token
    jwt.verify(token, superSecret, (err, decoded) => { // verifies secret and checks exp
      if (err) {
        res.json({message: messages.expError})
      }
      else { // if everything is good, save to request for use in other routes
        const userID = (req.page) ? req.page.userID : req.user.userID;
        if(decoded.userID !== userID){
          let err = new Error(messages.authError);
          err.status = 401;
          return next(err);
        }
        next();
      }
    });
  }
  else {
    let err = new Error(messages.tokenError);
    err.status = 401;
    next(err);
  }
};



module.exports = {
  checkLoginInput,
  checkMessageInput,
  checkSignUpInput,
  checkRateInput,
  checkUserInput,
  checkEditInput,
  authorizeUser
};