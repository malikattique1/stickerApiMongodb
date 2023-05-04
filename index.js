require('dotenv').config({ path: './config.env' });
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true })); 

app.use('/upload', express.static(path.join(__dirname, 'upload')));
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

app.get('/api', function (req, res) {
  res.status(200).send('API works.');
});

app.use('/api/user', require('./api/user/UserController'));

const port = process.env.PORT;

mongoose.connect(process.env.MONGO_URI).then(() => {
  console.log("Mongodb connected");
  app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
  });
}).catch((err) => {
  console.log({ err });
  process.exit(1);
});

module.exports = app;
