var express = require('express');
var router = express.Router();
var db = require('../../db');
var Sticker = require('./Sticker');

var jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');
var config = require('../../config');
var VerifyToken = require(__root + 'auth/VerifyToken');
const cloudinary = require('cloudinary');
const sizeOf = require('image-size');


const multer = require("multer");
// const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         if (file.fieldname === "sticker_path") {
//             let dir = `./upload/sticker`;
//             const fs = require('fs');
//             if (!fs.existsSync(dir)) {
//                 fs.mkdirSync(dir, {
//                     recursive: true
//                 });
//             }
//             cb(null, './upload/sticker');
//         }     
//     },
//     filename: (req, file, cb) => {
//         if (file.fieldname === "tray_icon") {
//             return cb(null, `${file.fieldname}_${Date.now()}_${file.originalname}`)
//         }
//         else if (file.fieldname === "poster_icon") {
//             return cb(null, `${file.fieldname}_${Date.now()}_${file.originalname}`)
//         }
//     }
// });


const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    fileFilter: function (req, file, cb) {
        if (file.mimetype !== "image/webp") {
            return cb(new Error('Files must be webp'));
        }
        cb(null, true);
    },
    limits: {
        fileSize: 1024 * 1024, // 1MB limit
    },
}).fields([
    { name: 'sticker_path', maxCount: 50 },
]);

const uploadFile = async function (req, res, next) {
    upload(req, res, function (err) {
        if (!req.files || !req.files['sticker_path']) {
            return res.status(400).json({ error: 'No stickers provided' });
        }
        if (err) {
            console.log(err);
            return res.status(400).json({
                success: 0,
                message: "File upload failed",
                error: err.message,
            });
        }
        next();
    });
};


// CREATE STICKERS (Single or Multiple)
router.post("/", VerifyToken, uploadFile, async function (req, res) {
    try {
        const files = req.files;

        // for Local storage
        // const file1 = file['sticker_path'][0] // single img
        // const fullUrl = `${req.protocol}://${req.headers.host}/`;
        // let hostpath = fullUrl;
        // const stickericondirectory = hostpath + 'upload/sticker' + '/' + file1.filename

        //for cloudinary storage
        const stickersData = [];
        for (const file of files['sticker_path']) {
            const dimensions = sizeOf(file.buffer);
            console.log("dimensions", dimensions)
            if (dimensions.width < 100 || dimensions.height < 100) {
                throw new Error('Image dimensions must be greater than 100x100');
            }
            const dataURL = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
            const cloudinaryUploadResult = await cloudinary.uploader.upload(dataURL, {
                folder: "stickerapp/upload/sticker",
            });
            const stickericondirectory = cloudinaryUploadResult.secure_url;
            const stickerData = {
                name: req.body.name,
                stickerpack_id: req.body.name,
                user_id: req.body.user_id,
                privacy: req.body.privacy,
                sticker_path: stickericondirectory,
                country: req.body.country,
                pack_order: req.body.pack_order,
                is_paid: req.body.is_paid,
                tags_sticker: req.body.tags_sticker,
            };
            stickersData.push(stickerData);
        }
        const posts = await Sticker.create(stickersData);
        return res.status(200).json({
            success: 1,
            data: posts
        });
    } catch (error) {
        console.log(error.message);
        return res.status(400).json({ error: error.message });
    }
});




// GETS ALL  STICKERS FROM THE DATABASE
router.get('/', VerifyToken, function (req, res) {
    Sticker.find({}, function (err, results) {
        if (err) return res.status(500).send("There was a problem finding the stickers.");
        return res.status(200).json({
            success: 1,
            data: results
        });
    });
});


// GETS A SINGLE STICKER FROM THE DATABASE
router.get('/:id', VerifyToken, function (req, res) {
    Sticker.findById(req.params.id, function (err, results) {
        if (err) return res.status(500).send("There was a problem finding the results.");
        if (!results) return res.status(404).send("No results found.");
        return res.status(200).json({
            success: 1,
            data: results
        });

    });
});


// DELETES A STICKER FROM THE DATABASE
router.delete('/:id', VerifyToken, function (req, res) {
    Sticker.findByIdAndRemove(req.params.id, function (err, results) {
        // console.log(results);
        if (err) return res.status(500).send("There was a problem deleting the results.");
        return res.status(200).json({
            success: 1,
            data: "Sticker: " + results.name + " was deleted."
        });

    });
});


// UPDATES A SINGLE STICKER IN THE DATABASE
router.put('/:id', VerifyToken, function (req, res) {
    var hashedPassword = bcrypt.hashSync(req.body.password, 8);
    req.body.password = hashedPassword;
    console.log(req.body)
    Sticker.findByIdAndUpdate(req.params.id, req.body, { new: true }, function (err, results) {
        if (err) return res.status(500).send("There was a problem updating the results.");
        return res.status(200).json({
            success: 1,
            data: results
        });
    });
});


module.exports = router;