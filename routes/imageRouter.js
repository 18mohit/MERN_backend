const express = require('express');
const router = express.Router();
const galleryModel = require('../models/gallery-model');
const { galleryImage, getAllGalleryImage } = require('../controllers/galleryController');
const multer = require('multer');

const upload = multer(); 
router.post('/gallery', upload.single('image'), galleryImage);
router.get('/gallery/allimages', getAllGalleryImage);

module.exports = router;