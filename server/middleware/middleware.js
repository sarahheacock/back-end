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
  const newNum = num.replace(/[^0-9]/gi, '');
  if(newNum.length === 11){
    return "+" + newNum;
  }
  else if(newNum.length === 10){
    return "+1" + newNum;
  }
  else {
    return newNum;
  }
};

const checkPhone = (newNum) => {
  //make sure num has <= 11 digits but >= 10 digits
  //newNum.replace("+", "");
  return /^[+]{1}([0-9]{10}|(1|0)[0-9]{10})$/.test(newNum);
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

  //is expiration date later than this month;
  const minDate = new Date(thisMonth + " " + thisYear).getTime();
  const expDate = new Date(m[0] + " " + year).getTime();

  return expDate > minDate;
}

const checkCVV = (cvv, num) => {
  const amn = /^(?:3[47][0-9]{13})$/.test(num);
  if(amn){ //amn express 4-digit
    return /^([0-9]{4})$/.test(cvv);
  }
  //visa, discover, and master card are 3-digit
  return /^([0-9]{3})$/.test(cvv);
}

const checkCredit = (num) => {
  const visa = /^(?:4[0-9]{12}(?:[0-9]{3})?)$/.test(num);
  const master = /^(?:5[1-5][0-9]{14})$/.test(num);
  const amn = /^(?:3[47][0-9]{13})$/.test(num);
  const disc = /^(?:6(?:011|5[0-9][0-9])[0-9]{12})$/.test(num);
  //Diners Club
  //JCB
  return visa || master || amn || disc;
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

const checkRoomInput = (req, res, next) => {

  const cForm = checkForm(req.body, galleryData);
  const cSize = checkSize(req.body, galleryData);

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

const checkGuideInput = (req, res, next) => {

  const cForm = checkForm(req.body, localGuideData);
  const cSize = checkSize(req.body, localGuideData);

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

  const cForm = (req.params.section === "home") ? checkForm(req.body, data.homeData) : checkForm(req.body, editData);
  const cSize = (req.params.section === "home") ? checkSize(req.body, data.homeData) : checkSize(req.body, editData);

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
  const cForm = (req.page) ? checkForm(req.body, data.signUpAdminData) : checkForm(req.body, signUpData);
  const cSize = (req.page) ? checkSize(req.body, data.signUpAdminData) : checkSize(req.body, signUpData);

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
    if(!cPass && !req.page){
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

  if(req.params.userInfo !== "credit" && req.params.userInfo !== "billing") {
    req.newOutput = req.body[req.params.userInfo];
    next();
  }
  else{
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

        const num = formatNum(req.body.number);
        const cCredit = checkCredit(num);
        if(!cCredit) message = messages.creditNumError;

        const cvv = formatNum(req.body.CVV);
        const ccvv = checkCVV(cvv, num);
        if(!ccvv) message = messages.cvvError;
      }

      if(message){
        res.json({message: message})
      }
      else {
        let keys = Object.keys(req.body);
        if(keys.includes("token")) keys.splice(keys.indexOf("token"), 1);
        req.newOutput = keys.map((k) => {
          if(k === "number" || k === "CVV" || k === "phone") return formatNum(req.body[k]);
          else return req.body[k].toString();
        }).join('/');
        console.log(req.newOutput);
        next();
      }
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
        res.json({message: messages.expError, user: data.initial.user})
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
  checkRoomInput,
  checkGuideInput,
  checkUserInput,
  checkEditInput,
  authorizeUser
};
