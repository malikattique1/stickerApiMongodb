var express = require('express');
var router = express.Router();


var db = require('../../db');
var User = require('./User');


var jwt = require('jsonwebtoken'); 
var bcrypt = require('bcryptjs');
var config = require('../../config'); 
var VerifyToken = require(__root + 'auth/VerifyToken');






// GETS ALL THE USERS IN THE DATABASE
// router.get('/', VerifyToken, function (req, res) {
//     User.find({}, function (err, users) {
//         if (err) return res.status(500).send("There was a problem finding the users.");
//         res.status(200).send(users);
//     });
// });
router.get('/', function (req, res) {
    User.find({}, function (err, users) {
        if (err) return res.status(500).send("There was a problem finding the users.");
        res.status(200).send(users);
    });
});
// router.get("/", async (req, res) => {
//     try {
//       res.json({
//         status: 200,
//         message: "Get data has successfully",
//       });
//     } catch (error) {
//       console.error(error);
//       return res.status(500).send("Server error");
//     }
//   });


// GETS A SINGLE USER FROM THE DATABASE
// router.get('/:id', VerifyToken, function (req, res) {
//     User.findById(req.params.id, function (err, user) {
//         if (err) return res.status(500).send("There was a problem finding the user.");
//         if (!user) return res.status(404).send("No user found.");
//         res.status(200).send(user);
//     });
// });









// // LOGIN
// router.post('/login', function(req, res) {
//   User.findOne({ email: req.body.email }, function (err, user) {
//     if (err) return res.status(500).send('Error on the server.');
//     if (!user) return res.status(404).send('No user found.');
//     var passwordIsValid = bcrypt.compareSync(req.body.password, user.password);
//     console.log(user.password);
//     console.log(req.body.password);
//     console.log(passwordIsValid);
//     if (!passwordIsValid) return res.status(401).send({ auth: false, token: null });
//     var token = jwt.sign({ id: user._id }, config.secret, {
//       // expiresIn: 86400 
//     });
//     res.status(200).send({ auth: true, token: token });
//   });
// });



// // CREATES A NEW USER
// router.post('/register', VerifyToken, function (req, res) {
//     var hashedPassword = bcrypt.hashSync(req.body.password, 8);
//     User.create({
//         name: req.body.name,
//         email: req.body.email,
//         // password : req.body.password
//         password: hashedPassword
//     },
//         function (err, user) {
//             if (err) return res.status(500).send("There was a problem adding the information to the database.");
//             res.status(200).send(user);
//         });
// });





// // DELETES A USER FROM THE DATABASE
// router.delete('/:id', VerifyToken, function (req, res) {
//     User.findByIdAndRemove(req.params.id, function (err, user) {
//         // console.log(user);
//         if (err) return res.status(500).send("There was a problem deleting the user.");
//         res.status(200).send("User: " + user.name + " was deleted.");
//     });
// });


// // UPDATES A SINGLE USER IN THE DATABASE
// router.put('/:id', VerifyToken, function (req, res) {
//     var hashedPassword = bcrypt.hashSync(req.body.password, 8);
//     req.body.password = hashedPassword;
//     console.log(req.body)
//     User.findByIdAndUpdate(req.params.id, req.body, { new: true }, function (err, user) {
//         if (err) return res.status(500).send("There was a problem updating the user.");
//         res.status(200).send(user);
//     });
// });


module.exports = router;







// const express = require("express");
// const router = express.Router();


// router.get("/", async (req, res) => {
//   try {
//     res.json({
//       status: 200,
//       message: "Get data has successfully",
//     });
//   } catch (error) {
//     console.error(error);
//     return res.status(500).send("Server error");
//   }
// });

// module.exports = router;


