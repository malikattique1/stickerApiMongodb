require("dotenv").config();
var express = require('express');
var app = express();

app.use(express.json());
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true })); 

const path = require('path');
app.use('/upload', express.static(path.join(__dirname, 'upload')))

const cors = require('cors');
app.use(cors({origin: true, credentials: true}));

app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.header("Access-Control-Allow-Headers", "x-access-token, Origin, X-Requested-With, Content-Type, Accept");
  next();
});



global.__root   = __dirname + '/'; 
app.get('/api', function (req, res) {
  res.status(200).send('API works.');
});

var UserController = require(__root + 'api/user/UserController');
app.use('/api/user', UserController);

var StickerController = require(__root + 'api/sticker/StickerController');
app.use('/api/sticker', StickerController);

var StickerpackController = require(__root + 'api/stickerpack/StickerpackController');
app.use('/api/stickerpack', StickerpackController);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log("server up and running on PORT :", port);
});

module.exports = app;