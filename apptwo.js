// require("dotenv").config();
require('dotenv').config({ path: './config.env' });

var express = require('express');
var apptwo= express();

apptwo.use(express.json());
const bodyParser = require('body-parser');
apptwo.use(bodyParser.urlencoded({ extended: true })); 

const path = require('path');
apptwo.use('/upload', express.static(path.join(__dirname, 'upload')))

const cors = require('cors');
apptwo.use(cors({origin: true, credentials: true}));

apptwo.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

apptwo.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.header("Access-Control-Allow-Headers", "x-access-token, Origin, X-Requested-With, Content-Type, Accept");
  next();
});



global.__root   = __dirname + '/'; 
apptwo.get('/api', function (req, res) {
  res.status(200).send('API works.');
});

var UserController = require(__root + 'api/user/UserController');
apptwo.use('/api/user', UserController);

var StickerController = require(__root + 'api/sticker/StickerController');
apptwo.use('/api/sticker', StickerController);

var StickerpackController = require(__root + 'api/stickerpack/StickerpackController');
apptwo.use('/api/stickerpack', StickerpackController);

const port = process.env.PORT || 3000;
apptwo.listen(port, () => {
  console.log("server up and running on PORT :", port);
});

module.exports = apptwo;