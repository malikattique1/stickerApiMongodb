// require("dotenv").config();
require('dotenv').config({ path: './config.env' });
// import mongoose from "mongoose";
var mongoose = require('mongoose');
// import "dotenv/config";



var express = require('express');
var index= express();

index.use(express.json());
const bodyParser = require('body-parser');
index.use(bodyParser.urlencoded({ extended: true })); 

const path = require('path');
index.use('/upload', express.static(path.join(__dirname, 'upload')))

const cors = require('cors');
index.use(cors({origin: true, credentials: true}));

index.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

index.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.header("Access-Control-Allow-Headers", "x-access-token, Origin, X-Requested-With, Content-Type, Accept");
  next();
});



global.__root   = __dirname + '/'; 


index.use('/api', function (req, res) {
  res.status(200).send('API works.');
});

// var UserController = require(__root + 'api/user/UserController');
// const UserController = require("./api/user/UserController");
const UserController = require("./api/user/UserController");
index.use('/api/user', UserController);

// var StickerController = require(__root + 'api/sticker/StickerController');
var StickerController = require('./api/sticker/StickerController');
index.use('/api/sticker', StickerController);

// var StickerpackController = require(__root + 'api/stickerpack/StickerpackController');
var StickerpackController = require('./api/stickerpack/StickerpackController');
index.use('/api/stickerpack', StickerpackController);


const port = process.env.PORT
// index.listen(port, () => {
//   console.log("server up and running on PORT :", port);
// });

mongoose.connect(process.env.MONGO_URI).then(() => {
  console.log("Mongodb connected");
  index.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
  });
}).catch((err) => {
  console.log({ err });
  process.exit(1);
});








module.exports = index;