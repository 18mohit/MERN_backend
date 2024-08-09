const jwt = require("jsonwebtoken");
const UserModel = require("../models/User-model");
const bcrypt = require("bcryptjs");
const { getPhotoUri, getCertificateUri } = require("../config/datauri");
const { cloudinary } = require("../config/cloudinary.JS");

const register = async (req, res) => {
  try {
    const { fullname, email, password, role, profile } = req.body;
    const photo = req.files.photo[0];
    const certificate = req.files.certificate[0];

    if (!fullname || !email || !password || !role || !photo || !certificate) {
      return res.status(400).json({
        message: "Something is missing",
        success: false,
      });
    }

    try {
      const photoUri = getPhotoUri(photo);
      const cloudPhotoResponse = await cloudinary.uploader.upload(
        photoUri.content
      );
      const certificateUri = getCertificateUri(certificate);
      const cloudCertificateResponse = await cloudinary.uploader.upload(
        certificateUri.content
      );

      const existingUser = await UserModel.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          message: "User already exists with this email",
          success: false,
        });
      }

      const hashpassword = await bcrypt.hash(password, 10);
      const newUser = await UserModel.create({
        fullname,
        email,
        password: hashpassword,
        role,
        photo: cloudPhotoResponse.secure_url,
        certificate: cloudCertificateResponse.secure_url,
        profile,
        Students: [] // Initialize as an empty array
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
        sameSite: "strict",
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
    const { fullname, email, bio, skills } = req.body;
    const certificate = req.files?.certificate
      ? req.files.certificate[0]
      : null;
    const photo = req.files?.photo ? req.files.photo[0] : null;

    // Upload to Cloudinary if files are provided
    let cloudCertificateResponse = null;
    let cloudPhotoResponse = null;

    if (certificate) {
      const certificateUri = getCertificateUri(certificate);
      cloudCertificateResponse = await cloudinary.uploader.upload(
        certificateUri.content
      );
    }
    if (photo) {
      const photoUri = getPhotoUri(photo);
      cloudPhotoResponse = await cloudinary.uploader.upload(photoUri.content);
    }

    // Find the user by email
    let user = await UserModel.findOne({ email });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
        success: false,
      });
    }

    // Update user fields
    user.fullname = fullname || user.fullname;
    user.profile.bio = bio || user.profile.bio;
    user.profile.skills = skills ? skills.split(",") : user.profile.skills;
    user.certificate = cloudCertificateResponse
      ? cloudCertificateResponse.secure_url
      : user.certificate;
    user.photo = cloudPhotoResponse
      ? cloudPhotoResponse.secure_url
      : user.photo;

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

module.exports = { register, login, logout, updateProfile, getAllSensei };
