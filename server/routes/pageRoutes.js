const express = require("express");
const pageRoutes = express.Router();
const Page = require("../models/page").Page;
const mid = require('../middleware/middleware');

const configure = require('../configure/config');
const bcrypt = require('bcrypt');
const data = require('../../data/data').data;
const initialEdit = require('../../data/data').initialEdit;
const initialMessage = require('../../data/data').initialMessage;

const keys = Object.keys(data);
// const jwt = require('jsonwebtoken');


pageRoutes.param("pageID", (req, res, next, id) => {
  Page.findById(id, (err, doc) => {
    if(err) return next(err);
    if(!doc){
      err = new Error("Page Not Found");
      err.status = 404;
      return next(err);
    }
    req.page = doc;
    return next();
  });
});

pageRoutes.param("section", (req, res, next, id) => {
  const section = req.page[id];
  if(!section){
    err = new Error("Page Route Found");
    err.status = 404;
    return next(err);
  }
  req.section = section;
  return next();
})

pageRoutes.param("sectionID", (req, res, next, id) => {
  const result = req.page.rates.rate.id(id);
  if(!result){
    let err = new Error("Rate not Found");
    err.status = 404;
    return next(err);
  }
  req.sectionID = result;
  return next();
});

const formatOutput = (obj) => {
  let newObj = {};
  keys.forEach((k) => {
    newObj[k] = obj[k]
  });
  return {rate: newObj, edit: initialEdit, message: initialMessage};
}


//===================GET SECTIONS================================
// pageRoutes.post('/', (req, res, next) => {
  let page = new Page(req.body);

  bcrypt.hash(page.password, 10, (err, hash) => {
    if (err) {
      return next(err);
    }
    page.password = hash;

    page.save((err, page) => {
      if(err){
        err = new Error("Page not created");
        err.status = 404;
        return next(err);
      }
      res.status(201);
      res.json(page)
    });

  });
})


//get page
pageRoutes.get('/:pageID', (req, res, next) => {
  res.status(200);
  let newObj = {};
  keys.forEach((k) => {
    newObj[k] = req.page[k]
  });
  res.json({rate: newObj});
});


//add rate
pageRoutes.post('/:pageID/:section', mid.authorizeUser, mid.checkRateInput, (req, res, next) => {
  req.section.rate.push(req.body);
  req.page.save((err, page) => {
    if(err){
      let err = new Error("Unable to add new rate. Contact Sarah.")
      err.status = 500;
      next(err)
    }
    res.status(201);
    res.json(formatOutput(page));
  });
});


//update page content
pageRoutes.put('/:pageID/:section/', mid.authorizeUser, mid.checkEditInput, (req, res, next) => {
  // Object.assign(req.section, req.body);
  req.page[req.params.section] = Object.assign({}, req.section, req.body);

  req.page.save((err,page) => {
    if(err){
      err = new Error("Unable to edit rate. Contact Sarah.");
      err.status = 500;
      return next(err);
    }
    res.status(200);
    res.json(formatOutput(page));
  });
})

//update rate
pageRoutes.put('/:pageID/:section/:sectionID', mid.authorizeUser, mid.checkRateInput, (req, res, next) => {
  Object.assign(req.sectionID, req.body);

  req.page.save((err,page) => {
    if(err){
      err = new Error("Unable to edit rate. Contact Sarah.");
      err.status = 500;
      return next(err);
    }
    res.status(200);
    res.json(formatOutput(page));
  });
})

//delete rate
pageRoutes.delete("/:pageID/:section/:sectionID", mid.authorizeUser, (req, res) => {
  req.sectionID.remove((err) => {
    req.page.save((err, page) => {
      if(err){
        err = new Error("Unable to delete rate. Contact Sarah.");
        err.status = 500;
        return next(err);
      }
      res.json(formatOutput(page));
    });
  });
});

module.exports = pageRoutes;
