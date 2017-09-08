const express = require("express");

const fileRoutes = express.Router();
const cloudinary = require('cloudinary');
const config = require('../configure/config');

// const mid = require('../middleware/middleware');

cloudinary.config({
  cloud_name: config.cloud_name,
  api_key: config.api_key,
  api_secret: config.api_secret
});

const multer  = require('multer');
const autoReap  = require('multer-autoreap');
const upload = multer({ dest: 'uploads/' });

autoReap.options.reapOnError = false;
fileRoutes.use(autoReap);

//======================EDIT SECTIONS==============================

fileRoutes.post("/", upload.single('file'), (req, res) => {
  if(!req.file) res.json({"message": "Unable to upload."});

  cloudinary.uploader.upload(req.file.path, (error, result) => {
    if(error) res.json(error);

    res.on('autoreap', (reapedFile) => {
      res.json(result);
    });
  });

});



module.exports = fileRoutes;
