const jwt = require("jsonwebtoken");
const UserModel = require("../models/User-model");
const bcrypt = require("bcryptjs");
const { getPhotoUri, getCertificateUri } = require("../config/datauri");
const { cloudinary } = require("../config/cloudinary");

const register = async (req, res) => {
  try {
    const { fullname, email, password, role, profile } = req.body;
    const photo = req.files.photo ? req.files.photo[0] : null;
    const certificate = req.files.certificate ? req.files.certificate[0] : null;

    if (!fullname || !email || !password || !role || !photo || !certificate) {
      return res.status(400).json({
        message: "Something is missing",
        success: false,
      });
    }

    // Determine the folder based on the user role for photos and certificates
    const photoFolderMapping = {
      Owner: "OWNER_Image",
      Sensei: "SENSEI'S Image",
      Student: "LOG IN STUDENT'S Image",
    };
    const certificateFolderMapping = {
      Owner: "OWNER Certificate",
      Sensei: "SENSEI'S Certificate",
      Student: "LOG IN STUDENT'S Certificate",
    };

    const photoFolder = photoFolderMapping[role] || "Default Image";
    const certificateFolder = certificateFolderMapping[role] || "Default Certificate";

    try {
      // Upload photo to Cloudinary
      const photoUri = getPhotoUri(photo);
      const cloudPhotoResponse = await cloudinary.uploader.upload(photoUri.content, {
        folder: photoFolder,
        transformation: [
          { crop: "scale", width: 500 },
          { quality: "auto:low" },
          { fetch_format: "webp" },
        ],
      });

      // Upload certificate to Cloudinary
      const certificateUri = getCertificateUri(certificate);
      const cloudCertificateResponse = await cloudinary.uploader.upload(certificateUri.content, {
        folder: certificateFolder,
        transformation: [
          { crop: "scale", width: 500 },
          { quality: "auto:low" },
          { fetch_format: "webp" },
        ],
      });

      // Check for existing user
      const existingUser = await UserModel.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          message: "User already exists with this email",
          success: false,
        });
      }

      // Create new user
      const hashpassword = await bcrypt.hash(password, 10);
      const newUser = await UserModel.create({
        fullname,
        email,
        password: hashpassword,
        role,
        photo: cloudPhotoResponse.secure_url,
        certificate: cloudCertificateResponse.secure_url,
        profile,
        Students: [],
      });

      return res.status(200).json({
        message: "Account created successfully",
        user: newUser,
        success: true,
      });
    } catch (error) {
      console.log("cloudinary=> ", error);
      return res.status(500).json({
        message: "Error uploading files to cloudinary",
        success: false,
      });
    }
  } catch (error) {
    console.error("Error in register function:", error);
    return res.status(500).json({
      message: "Something went wrong",
      success: false,
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password, role } = req.body;
    if (!email || !password || !role) {
      return res.status(400).json({
        message: "Something is missing",
        success: false,
      });
    }

    let user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(400).json({
        message: "Incorrect email or password",
        success: false,
      });
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res.status(400).json({
        message: "Incorrect email or password",
        success: false,
      });
    }

    if (user.role !== role) {
      return res.status(400).json({
        message: "Incorrect role",
        success: false,
      });
    }

    const tokenData = { _id: user._id }; // Ensure the payload includes the user ID
    const token = jwt.sign(tokenData, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });
    console.log('Setting cookie with token:', token)

    user = {
      _id: user._id,
      fullname: user.fullname,
      email: user.email,
      role: user.role,
      photo: user.photo,
      certificate: user.certificate,
    };

    return res
      .status(200)
      .cookie("token", token, {
        maxAge: 1 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        sameSite: 'lax', // or 'none' if cross-origin requests are required
        secure: true, // Ensure this is true in production if using HTTPS
      })
      .json({
        message: `Welcome back ${user.fullname}`,
        user,
        success: true,
      });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

const logout = async (req, res) => {
  try {
    res.status(200).cookie("token", "", { maxAge: 0 }).json({
      message: "Logout successfully",
      success: true,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { fullname, email, bio, skills, role } = req.body;
    const certificate = req.files?.certificate ? req.files.certificate[0] : null;
    const photo = req.files?.photo ? req.files.photo[0] : null;

    // Find the user by email first to get the existing role if not provided in the request
    let user = await UserModel.findOne({ email });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
        success: false,
      });
    }

    // Use the role from the request body or fall back to the existing user role if role is not provided
    const userRole = role || user.role;

    // Determine the folder based on the user role for photos
    const photoFolderMapping = {
      Owner: "OWNER_Image",
      Sensei: "SENSEI'S Image",
      Student: "LOG IN STUDENT'S Image",
    };
    const certificateFolderMapping = {
      Owner: "OWNER Certificate",
      Sensei: "SENSEI'S Certificate",
      Student: "LOG IN STUDENT'S Certificate",
    };

    const photoFolder = photoFolderMapping[userRole] || "Default Image"; // Use the correct folder based on role
    const certificateFolder = certificateFolderMapping[userRole] || "Default Certificate"; // Use the correct folder based on role

    // Upload to Cloudinary if files are provided
    let cloudCertificateResponse = null;
    let cloudPhotoResponse = null;

    if (certificate) {
      const certificateUri = getCertificateUri(certificate);
      cloudCertificateResponse = await cloudinary.uploader.upload(certificateUri.content, {
        folder: certificateFolder,
        transformation: [
          { crop: "scale", width: 500 },
          { quality: "auto:low" },
          { fetch_format: "webp" },
        ],
      });
    }

    if (photo) {
      const photoUri = getPhotoUri(photo);
      cloudPhotoResponse = await cloudinary.uploader.upload(photoUri.content, {
        folder: photoFolder,
        transformation: [
          { crop: "scale", width: 500 },
          { quality: "auto:low" },
          { fetch_format: "webp" },
        ],
      });
    }

    // Update user fields
    user.fullname = fullname || user.fullname;
    user.profile.bio = bio || user.profile.bio;
    user.profile.skills = skills ? skills.split(",") : user.profile.skills;
    user.certificate = cloudCertificateResponse ? cloudCertificateResponse.secure_url : user.certificate;
    user.photo = cloudPhotoResponse ? cloudPhotoResponse.secure_url : user.photo;

    // Save the updated user data
    await user.save();

    return res.status(200).json({
      message: "User updated successfully.",
      user,
      success: true,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

const getAllSensei = async (req, res) => {
  try {
    const users = await UserModel.find({ role:"Sensei" });
    return res.status(200).json({
      message: "Users retrieved successfully",
      users,
      success: true,
    });
  } catch (error) {
    console.error("Error in getAllUsers function:", error); // Log the error details
    return res.status(500).json({
      message: "Something went wrong",
      success: false,
    });
  }
};

const deleteUser = async (req, res) => {
  try {
      const user = await UserModel.findByIdAndDelete(req.params.id);
      if (!user) return res.status(404).json({ success: false, message: "iser not found" });
      res.json({ success: true, message: "user deleted!!" });
  } catch (error) {
      res.status(500).json({ success: false, message: "Server error" });
  }
}

module.exports = { register, login, logout, updateProfile, getAllSensei, deleteUser };
