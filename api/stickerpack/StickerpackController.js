var express = require('express');
var router = express.Router();


var db = require('../../db');

var Stickerpack = require('./Stickerpack');


var jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');
var config = require('../../config');
var VerifyToken = require(__root + 'auth/VerifyToken');




const multer = require("multer");
// const path = require("path");
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        if (file.fieldname === "tray_icon") {
            let dir = `./upload/stickerpack/trayicon`;
            const fs = require('fs');
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, {
                    recursive: true
                });
            }
            cb(null, './upload/stickerpack/trayicon');
        }
        else if (file.fieldname === "poster_icon") {
            let dir = `./upload/stickerpack/postericon`;
            const fs = require('fs');
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, {
                    recursive: true
                });
            }
            cb(null, './upload/stickerpack/postericon');
        }

    },
    // destination: './uploads',
    filename: (req, file, cb) => {
        if (file.fieldname === "tray_icon") {
            return cb(null, `${file.fieldname}_${Date.now()}_${file.originalname}`)
        }
        else if (file.fieldname === "poster_icon") {
            return cb(null, `${file.fieldname}_${Date.now()}_${file.originalname}`)
        }
    }
});
const file_filter = (req, file, cb) => {
    if (file.mimetype == "image/png") {
        cb(null, true)
    }
    else {
        cb(new Error('File not png'), false)
        //  cb(null, false)
    }
}


uploadFile = function (req, res, next) {
    const upload = multer({
        storage: storage,
        fileFilter: file_filter,
        limits: {
            fileSize: 50000
        }
    })
        .fields([{ name: 'tray_icon', maxCount: 1 },
        { name: 'poster_icon', maxCount: 1 }]);

    upload(req, res, function (err) {
        if (err instanceof multer.MulterError) {
            res.send(err);
        } else if (err) {

            return res.status(400).json({
                success: 0,
                message: "only png with less than 50kb size allowed",
            });
            // res.send(err);
        } else {
            next();
        }
    })
},






    router.post('/', VerifyToken, uploadFile, function (req, res) {

        const file = req.files;
        console.log(file);
        const file1 = file['tray_icon'][0] // single img
        const file2 = file['poster_icon'][0]  // single img

        const fullUrl = `${req.protocol}://${req.headers.host}/`;
        let hostpath = fullUrl;
        const trayicondirectory = hostpath + 'upload/stickerpack/trayicon' + '/' + file1.filename
        const poster_icondirectory = hostpath + 'upload/stickerpack/postericon' + '/' + file2.filename;


        Stickerpack.create({
            name: req.body.name,
            owner: req.body.owner,
            privacy: req.body.privacy,
            tray_icon: trayicondirectory,
            country: req.body.country,
            poster_icon: poster_icondirectory,
            pack_category: req.body.pack_category,
            is_paid: req.body.is_paid,
            is_animated: req.body.is_animated,
        },
            function (err, results) {
                console.log(results);
                if (err) return res.status(500).send("There was a problem adding the information to the database.");
                res.status(200).send(results);
            });
    });


router.get('/', VerifyToken, function (req, res) {
    Stickerpack.find({}, function (err, users) {
        if (err) return res.status(500).send("There was a problem finding the users.");
        res.status(200).send(users);
    });
});


router.get('/:id', VerifyToken, function (req, res) {
    Stickerpack.findById(req.params.id, function (err, results) {
        if (err) return res.status(500).send("There was a problem finding the results.");
        if (!results) return res.status(404).send("No results found.");
        res.status(200).send(results);
    });
});


router.delete('/:id', VerifyToken, function (req, res) {
    Stickerpack.findByIdAndRemove(req.params.id, function (err, results) {
        // console.log(results);
        if (err) return res.status(500).send("There was a problem deleting the results.");
        res.status(200).send("Stickerpack: " + results.name + " was deleted.");
    });
});


router.put('/:id', VerifyToken, function (req, res) {
    var hashedPassword = bcrypt.hashSync(req.body.password, 8);
    req.body.password = hashedPassword;
    console.log(req.body)
    Stickerpack.findByIdAndUpdate(req.params.id, req.body, { new: true }, function (err, results) {
        if (err) return res.status(500).send("There was a problem updating the results.");
        res.status(200).send(results);
    });
});


module.exports = router;