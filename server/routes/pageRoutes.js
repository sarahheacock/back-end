const express = require("express");
const pageRoutes = express.Router();
const Page = require("../models/page").Page;
const Room = require("../models/page").Room;
const mid = require('../middleware/middleware');

const configure = require('../configure/config');
const bcrypt = require('bcrypt');
// const links = require('../../data/data').links;
const initialEdit = require('../../data/data').initial.edit;
const initialMessage = require('../../data/data').initial.message;

// const end = links.length;
// const keys = links.slice(0, end - 1);



pageRoutes.param("pageID", (req, res, next, id) => {
  Page.findById(id).populate({
    path: 'gallery.rooms',
    model: 'Room'
  }).exec((err, doc) => {
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

const format = (obj) => {
  let newObj = {edit: initialEdit, message: initialMessage};
  const arr = ["home", "gallery", "guide"];

  arr.forEach((k) => {
    newObj[k] = obj[k]
  });

  return newObj;
}


//===================PAGE ROUTES================================
//create page
pageRoutes.post('/', (req, res, next) => {
  // let page = new Page(req.body);
  let page = new Page({
    "name": "test",
    "password": "password"
  });
  let room = new Room();

  room.save((err, rooms) => {
    bcrypt.hash(page.password, 10, (err, hash) => {
      if (err) return next(err);
      page.password = hash;
      page.gallery.rooms.push(rooms._id);

      page.save((err, page) => {
        if(err) return next(err);
        res.status(201);
        res.json(page);
      });

    });
  });
});


//get page
pageRoutes.get('/:pageID', (req, res, next) => {
  res.status(200);
  res.json(format(req.page));
});


//add room
pageRoutes.post('/:pageID/room', mid.authorizeUser, mid.checkRoomInput, (req, res, next) => {
  let room = new Room(req.body);

  room.save((err, rooms) => {
    req.page.updateRooms((err, page) => {
      if(err){
        err = new Error("Rooms not updated");
        err.status = 404;
        return next(err);
      }
      res.status(201);
      res.json(format(page));
    });
  });
});

//add guide
pageRoutes.post('/:pageID/guide', mid.authorizeUser, mid.checkGuideInput, (req, res, next) => {
  req.page["guide"]["guide"].push(req.body);

  req.page.save((err, page) => {
    if(err){
      let err = new Error("Unable to add guide")
      err.status = 500;
      next(err)
    }
    res.status(201);
    res.json(format(page));
  });
});


//update page content
pageRoutes.put('/:pageID/:section/', mid.authorizeUser, mid.checkEditInput, (req, res, next) => {
  // Object.assign(req.section, req.body);
  let result = req.page[req.params.section];
  if(!result){
    err = new Error("Not found");
    next(err);
  }
  req.page[req.params.section] = Object.assign({}, result, req.body);

  req.page.save((err,page) => {
    if(err){
      // err = new Error("Unable to edit rate. Contact Sarah.");
      // err.status = 500;
      return next(err);
    }
    res.status(200);
    res.json(format(page));
  });
})

//update room
pageRoutes.put('/:pageID/room/:roomID', mid.authorizeUser, mid.checkRoomInput, (req, res, next) => {
  Room.findById(req.params.roomID, (err, room) => {
    if(err) next(err);
    if(!room){
      err = new Error("Room not found");
      next(err);
    }

    Object.assign(room, req.body);
    room.save((err, doc) => {
      req.page.updateRooms((err, page) => {
        if(err){
          err = new Error("Rooms not updated");
          err.status = 404;
          return next(err);
        }
        res.status(200);
        res.json(format(page));
      });
    });

  });
});

//update guide
pageRoutes.put('/:pageID/guide/:guideID', mid.authorizeUser, mid.checkGuideInput, (req, res, next) => {
  let result = req.page["guide"].guide.id(req.params.guideID);
  if(!result){
    err = new Error("Guide not found");
    next(err);
  }
  Object.assign(result, req.body);

  req.page.save((err, page) => {
    if(err){
      // err = new Error("Guide not updated");
      // err.status = 404;
      return next(err);
    }
    res.status(200);
    res.json(format(page));
  });
})

//delete room
pageRoutes.delete("/:pageID/room/:roomID", mid.authorizeUser, (req, res) => {
  Room.findById(req.params.roomID, (err, room) => {
    if(err) next(err);
    if(!room){
      err = new Error("Room not found");
      next(err);
    }

    room.remove((err, doc) => {
      req.page.updateRooms((err, page) => {
        if(err){
          err = new Error("Rooms not updated");
          err.status = 404;
          return next(err);
        }
        res.json(format(page));
      });
    });

  });
});

//delete guide
pageRoutes.delete("/:pageID/:guide/:guideID", mid.authorizeUser, (req, res) => {
  let result = req.page["guide"].guide.id(req.params.guideID);
  if(!result){
    err = new Error("Guide not found");
    next(err);
  }

  result.remove((err) => {
    req.page.save((err, page) => {
      if(err){
        return next(err);
      }
      res.json(format(page));
    });
  });
});

module.exports = pageRoutes;
