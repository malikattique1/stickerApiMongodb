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

// router.post('/', VerifyToken, function (req, res) {
//     Sticker.create({
//         name: req.body.name,
//         stickerpack_id: req.body.name,
//         user_id: req.body.user_id,
//         privacy: req.body.privacy,
//         sticker_path: req.body.sticker_path,
//         country: req.body.country,
//         pack_order: req.body.pack_order,
//         is_paid: req.body.is_paid,
//         tags_sticker: req.body.tags_sticker

//     },
//         function (err, results) {
//             // console.log(results);
//             if (err) return res.status(500).send("There was a problem adding the information to the database.");
//             res.status(200).send(results);
//         });
// });





// CREATE STICKERS (Single or Multiple)
router.post('/', VerifyToken, async function (req, res) {
    try {
        async function processSingleFile(sticker_file) {
            if (sticker_file.size > 1024 * 1024) {
                throw new Error('File size exceeds the limit of 1MB');
            }
            if (sticker_file.mimetype !== "image/webp") {
                throw new Error('Files must be webp');
            }

            const dimensions = sizeOf(sticker_file.data);
            if (dimensions.width < 50 || dimensions.height < 50) {
                throw new Error('Image dimensions must be greater than 50x50');
            }

            const dataURL = `data:${sticker_file.mimetype};base64,${sticker_file.data.toString('base64')}`;
            const myCloud = await cloudinary.uploader.upload(dataURL, {
                folder: "stickerapp/upload/sticker",
            });
            // return {
            //     public_id: myCloud.public_id,
            //     url: myCloud.secure_url,
            // };
            return myCloud.secure_url
        }

        const stickerArray = req.files['sticker_path'];
        const isMultipleStickers = Array.isArray(stickerArray);

        if (!stickerArray) {
            return res.status(400).json({ error: 'No stickers provided' });
        }

        const postData = [];

        if (isMultipleStickers) {
            // NOT Allowing multiple stickers
            // throw new Error('Multiple stickers upload is not allowed');

            // Allowing multiple stickers
            for (const sticker_file of stickerArray) {
                const fileData = await processSingleFile(sticker_file);

                const stickerPostData = {
                    name: req.body.name,
                    stickerpack_id: req.body.name,
                    user_id: req.body.user_id,
                    privacy: req.body.privacy,
                    sticker_path: fileData,
                    country: req.body.country,
                    pack_order: req.body.pack_order,
                    is_paid: req.body.is_paid,
                    tags_sticker: req.body.tags_sticker,
                };

                postData.push(stickerPostData);
            }
        } else {
            // Process single sticker
            const sticker_file = stickerArray;
            const fileData = await processSingleFile(sticker_file);

            const stickerPostData = {
                name: req.body.name,
                stickerpack_id: req.body.name,
                user_id: req.body.user_id,
                privacy: req.body.privacy,
                sticker_path: fileData,
                country: req.body.country,
                pack_order: req.body.pack_order,
                is_paid: req.body.is_paid,
                tags_sticker: req.body.tags_sticker,
            };

            postData.push(stickerPostData);
        }

        const posts = await Sticker.create(postData);
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