const { cloudinary } = require("../config/cloudinary.JS");
const { getImageGalleryUri } = require("../config/datauri");
const galleryModel = require("../models/gallery-model");

const galleryImage = async (req, res) => {
    try {
        const image = req.file; // Corrected from req.files.image[0] to req.file
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

module.exports = { galleryImage, getAllGalleryImage };
