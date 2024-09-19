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
            // Use req.file.path directly if using multer
            const cloudPhotoResponse = await cloudinary.uploader.upload(image.path, {
                folder: "GALLERY_Image", // Set folder path
                transformation: [
                    { width: 800, height: 600, crop: "limit" }, // Set size limits
                    { quality: "auto:low" }, // Reduce quality to keep file size low
                    { fetch_format: "auto" }, // Optimize format
                ],
                eager: [
                    { transformation: [{ width: 800, height: 600, crop: "limit", quality: "auto", fetch_format: "auto" }] },
                ],
                resource_type: "image", // Ensures we are uploading an image
                format: "jpg", // Convert to jpg if necessary
                invalidate: true,
                bytes_limit: 50000 // Limit image size to 50KB (50 * 1024 bytes)
            });

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
