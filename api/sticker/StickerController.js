var express = require('express');
var router = express.Router();


var db = require('../../db');
var Sticker = require('./Sticker');


var jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');
var config = require('../../config');
var VerifyToken = require(__root + 'auth/VerifyToken');
const cloudinary = require('cloudinary');


// router.post('/', VerifyToken, function (req, res) {

//     Sticker.create({
//         name: req.body.name,
//         stickerpack_id: req.body.name,
//         user_id: req.body.user_id,
//         rating: req.body.rating,
//         downloads: req.body.downloads,
//         download_size: req.body.download_size,
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






router.post('/', VerifyToken, async function (req, res) {
    try {


        async function processSingleFile(sticker_file) {
            if (sticker_file.size > 1024 * 1024) {
                throw new Error('File size exceeds the limit of 1MB');
                // return res.status(500).json({ error: 'File size exceeds the limit of 1MB' });
              }



            const dataURL = `data:${sticker_file.mimetype};base64,${sticker_file.data.toString('base64')}`;
            const myCloud = await cloudinary.uploader.upload(dataURL, {
                folder: "stickerapp/upload/sticker",
            });
            return {
                public_id: myCloud.public_id,
                url: myCloud.secure_url,
            };
        }

        async function processMultipleFiles(sticker_files) {
            const uploadedFiles = [];
            for (const sticker_file of sticker_files) {
                const fileData = await processSingleFile(sticker_file);
                uploadedFiles.push(fileData);
            }
            return uploadedFiles;
        }


        console.log("st", req.body);
        var sticker_files = req.files['sticker_path'];
        console.log("sticker_files",sticker_files)

        if (!sticker_files) {
            return res.status(400).json({ error: 'No files provided' });
        }

        var postData;
        if (Array.isArray(sticker_files)) {
            // Multiple files
            const uploadedFiles = await processMultipleFiles(sticker_files);
            postData = {
                name: req.body.name,
                stickerpack_id: req.body.name,
                user_id: req.body.user_id,
                privacy: req.body.privacy,
                sticker_path: uploadedFiles,
                country: req.body.country,
                pack_order: req.body.pack_order,
                is_paid: req.body.is_paid,
                tags_sticker: req.body.tags_sticker,
            };
        } else {
            // Single file
            const fileData = await processSingleFile(sticker_files);
            postData = {
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
        }

        const post = await Sticker.create(postData);
        res.status(201).json(post);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An unexpected error occurred.' });
    }
});







router.get('/', VerifyToken, function (req, res) {
    Sticker.find({}, function (err, users) {
        if (err) return res.status(500).send("There was a problem finding the users.");
        res.status(200).send(users);
    });
});





// GETS A SINGLE USER FROM THE DATABASE
router.get('/:id', VerifyToken, function (req, res) {
    Sticker.findById(req.params.id, function (err, results) {
        if (err) return res.status(500).send("There was a problem finding the results.");
        if (!results) return res.status(404).send("No results found.");
        res.status(200).send(results);
    });
});


// DELETES A USER FROM THE DATABASE
router.delete('/:id', VerifyToken, function (req, res) {
    Sticker.findByIdAndRemove(req.params.id, function (err, results) {
        // console.log(results);
        if (err) return res.status(500).send("There was a problem deleting the results.");
        res.status(200).send("Sticker: " + results.name + " was deleted.");
    });
});


// UPDATES A SINGLE USER IN THE DATABASE
router.put('/:id', VerifyToken, function (req, res) {
    var hashedPassword = bcrypt.hashSync(req.body.password, 8);
    req.body.password = hashedPassword;
    console.log(req.body)
    Sticker.findByIdAndUpdate(req.params.id, req.body, { new: true }, function (err, results) {
        if (err) return res.status(500).send("There was a problem updating the results.");
        res.status(200).send(results);
    });
});


module.exports = router;