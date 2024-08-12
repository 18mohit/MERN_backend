const { cloudinary } = require("../config/cloudinary");
const { getImageGalleryUri } = require("../config/datauri");
const galleryModel = require("../models/gallery-model");

const galleryImage = async (req, res) => {
    try {
        const image = req.file; 
        if (!image) {
            return res.status(400).json({
                msg: "Please upload an image",
                success: false,
            });
        }

        try {
            const imageUri = getImageGalleryUri(image);
            const cloudPhotoResponse = await cloudinary.uploader.upload(imageUri.content);
            const finalUri = await galleryModel.create({
                image: cloudPhotoResponse.secure_url,
                userId: req.body.userId, // Saving the userId with the image
            });
            return res.status(201).json({
                msg: "Image uploaded successfully",
                success: true,
                data: finalUri.image,
            });
        } catch (error) {
            console.log("Error in Cloudinary:", error);
            return res.status(500).json({
                msg: "Error uploading image to Cloudinary",
                success: false,
            });
        }
    } catch (error) {
        console.log("Image error gallery:", error);
        return res.status(500).json({
            msg: "Error processing image upload",
            success: false,
        });
    }
};

const getAllGalleryImage = async (req, res) => {
    try {
        const images = await galleryModel.find();
        return res.status(200).json({
            message: "Gallery images retrieved successfully",
            success: true,
            images,
        });
    } catch (error) {
        console.log("faild get allimage",error);
    }
}

const deleteImage = async (req, res) => {
    try {
        const image = await galleryModel.findByIdAndDelete(req.params.id);
        if (!image) return res.status(404).json({ success: false, message: "Image not found" });
        res.json({ success: true, message: "Image deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error" });
    }
}

module.exports = { galleryImage, getAllGalleryImage, deleteImage };
