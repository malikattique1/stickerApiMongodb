var express = require('express');
var router = express.Router();


var db = require('../../db');

var Stickerpack = require('./Stickerpack');


var jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');
var config = require('../../config');
var VerifyToken = require('../../auth/VerifyToken');
// var VerifyToken = require(__root + 'auth/VerifyToken');

const cloudinary = require('cloudinary');
const sizeOf = require('image-size');


const multer = require("multer");
// const path = require("path");


//for local storage
// const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         if (file.fieldname === "tray_icon") {
//             let dir = `./upload/stickerpack/trayicon`;
//             const fs = require('fs');
//             if (!fs.existsSync(dir)) {
//                 fs.mkdirSync(dir, {
//                     recursive: true
//                 });
//             }
//             cb(null, './upload/stickerpack/trayicon');
//         }
//         else if (file.fieldname === "poster_icon") {
//             let dir = `./upload/stickerpack/postericon`;
//             const fs = require('fs');
//             if (!fs.existsSync(dir)) {
//                 fs.mkdirSync(dir, {
//                     recursive: true
//                 });
//             }
//             cb(null, './upload/stickerpack/postericon');
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

//for cloudinary
const storage = multer.memoryStorage();
const file_filter = (req, file, cb) => {
    if (file.mimetype == "image/png") {
        cb(null, true);
    } else {
        cb(new Error('File not png'), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: file_filter,
    limits: {
        fileSize: 50000000
    }
}).fields([
    { name: 'tray_icon', maxCount: 5 },
    { name: 'poster_icon', maxCount: 50 }
]);

const uploadFile = function (req, res, next) {
    upload(req, res, function (err) {
        if (err instanceof multer.MulterError) {
            res.send(err);
        } else if (err) {
            console.log(err)
            return res.status(400).json({
                success: 0,
                message: "Only png with less than 50kb size allowed",
                error: err
            });
        } else {
            next();
        }
    });
};




router.post('/', VerifyToken, uploadFile, async function (req, res) {

    try {
        const files = req.files;
        var posterIcons=files['poster_icon']
        var trayIcons=files['tray_icon']

        //for local storage
        // const file1 = file['tray_icon'][0] // single img
        // const file2 = file['poster_icon'][0]  // single img
        // const fullUrl = `${req.protocol}://${req.headers.host}/`;
        // let hostpath = fullUrl;
        // const trayicondirectory = hostpath + 'upload/stickerpack/trayicon' + '/' + file1.filename
        // const poster_icondirectory = hostpath + 'upload/stickerpack/postericon' + '/' + file2.filename;


        //for cloudinary storage
        const stickerspackData = [];
        for (const file of posterIcons) {

            const dimensions = sizeOf(file.buffer);
            console.log("dimensions", dimensions)
            if (dimensions.width < 100 || dimensions.height < 100) {
                throw new Error('Image dimensions must be greater than 100x100');
            }



            const dataURLposter = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
            const cloudinaryUploadResultposter = await cloudinary.uploader.upload(dataURLposter, {
                folder: "stickerapp/upload/stickerpack/postericon",
            });
            const postericondirectory = cloudinaryUploadResultposter.secure_url;



            const trayicondirectory  = [];
            for (const filetray of trayIcons) {
            const dataURLtrayicons = `data:${filetray.mimetype};base64,${filetray.buffer.toString('base64')}`;
            const cloudinaryUploadResult = await cloudinary.uploader.upload(dataURLtrayicons, {
                folder: "stickerapp/upload/stickerpack/trayicon",
            });
            const trayicon = cloudinaryUploadResult.secure_url;
            trayicondirectory.push({url:trayicon})
        }



            const stickerpackData = {
                name: req.body.name,
                owner: req.body.owner,
                privacy: req.body.privacy,
                tray_icon: trayicondirectory,
                country: req.body.country,
                poster_icon: postericondirectory,
                pack_category: req.body.pack_category,
                is_paid: req.body.is_paid,
                is_animated: req.body.is_animated,
            };
            stickerspackData.push(stickerpackData);
        }
        const posts = await Stickerpack.create(stickerspackData);
        return res.status(200).json({
            success: 1,
            data: posts
        });
    } catch (error) {
        console.log(error.message);
        return res.status(400).json({ error: error.message });
    }

});







// CREATE STICKERPACK (Single or Multiple)
router.get('/', VerifyToken, function (req, res) {
    Stickerpack.find({}, function (err, results) {
        if (err) return res.status(500).send("There was a problem finding the stickerpacks.");
        return res.status(200).json({
            success: 1,
            data: results
        });
    });
});


router.get('/:id', VerifyToken, function (req, res) {
    Stickerpack.findById(req.params.id, function (err, results) {
        if (err) return res.status(500).send("There was a problem finding the results.");
        if (!results) return res.status(404).send("No results found.");
        return res.status(200).json({
            success: 1,
            data: results
        });
    });
});


router.delete('/:id', VerifyToken, function (req, res) {
    Stickerpack.findByIdAndRemove(req.params.id, function (err, results) {
        // console.log(results);
        if (err) return res.status(500).send("There was a problem deleting the results.");
        return res.status(200).json({
            success: 1,
            data: "Stickerpack: " + results.name + " was deleted."
        });
    });
});


router.put('/:id', VerifyToken, function (req, res) {
    var hashedPassword = bcrypt.hashSync(req.body.password, 8);
    req.body.password = hashedPassword;
    console.log(req.body)
    Stickerpack.findByIdAndUpdate(req.params.id, req.body, { new: true }, function (err, results) {
        if (err) return res.status(500).send("There was a problem updating the results.");
        return res.status(200).json({
            success: 1,
            data: results
        });
    });
});


module.exports = router;