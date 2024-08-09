const SenseiStuModel = require("../models/sensei-student-model");
const UserModel = require("../models/User-model");
const bcrypt = require("bcryptjs");
const { cloudinary } = require("../config/cloudinary.JS");

const registerStu = async (req, res) => {
  try {
    const { studentname, date, userId } = req.body;
    const certificate = req.files.certificate ? req.files.certificate[0] : null;

    if (!studentname || !date || !certificate) {
      return res.status(400).json({
        message: "Something is missing",
        success: false,
      });
    }

    // Upload certificate to Cloudinary
    const certificateUpload = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { resource_type: "auto" },
        (error, result) => {
          if (error) {
            return reject(error);
          }
          resolve(result);
        }
      );
      uploadStream.end(certificate.buffer);
    });

    const student = await SenseiStuModel.create({
      studentname,
      date,
      certificate: certificateUpload.secure_url,
      Added_by: userId,
    });

    // Update the user's Students array
    await UserModel.findByIdAndUpdate(
      userId,
      { $push: { Students: student._id } },
      { new: true, useFindAndModify: false }
    );

    return res.status(200).json({
      message: "Student added successfully",
      student,
      success: true,
    });
  } catch (error) {
    console.error("Error registering student:", error);
    return res.status(500).json({
      message: "Internal Server Error",
      success: false,
    });
  }
};

const getStudent = async (req, res) => {
  try {
    const Added_by = req.id; //sensei student
    const students = await SenseiStuModel.find({ Added_by });
    if (!students) {
      return res.send(404).json({
        message: "No students found",
        success: false,
      });
    }
    return res.status(200).json({
      students,
      success: true,
    });
  } catch (error) {
    console.log(error);
  }
};

const getStudentById = async (req, res) => {
  try {
    const studentId = req.params.id;
    const student = await SenseiStuModel.findById(studentId);
    if (!student) {
      return res.send(404).json({
        message: "Student not found",
        success: false,
      });
    }
    return res.status(200).json({
      student,
      success: true,
    });
  } catch (error) {
    console.log(error);
  }
};

const updateStudent = async (req, res) => {
  try {
    const { studentname, date, certificate } = req.body;
    const file = req.file;
    //clousdinney

    const updateData = { studentname, date, certificate };

    const student = await SenseiStuModel.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!student) {
      return res.send(404).json({
        message: "Student not found",
        success: false,
      });
    }
    return res.status(200).json({
      message: "Student updated..",
      success: true,
      // student,
    });
  } catch (error) {
    console.log(error);
  }
};

const getAllStu = async (req, res) => {
  try {
    const students = await SenseiStuModel.find();
    return res.status(200).json({
      message: "students retrieved successfully",
      students,
      success: true,
    });
  } catch (error) {
    console.error("Error in getAllStu function:", error); // Log the error details
    return res.status(500).json({
      message: "Something went wrong",
      success: false,
    });
  }
};

const getAllStuBySensei = async (req, res) => {
  try {
    const senseiId = req.params.id;
    console.log("Fetching students for Sensei ID:", senseiId); // Add logging

    const students = await SenseiStuModel.find({ Added_by: senseiId });
    console.log("Students found:", students); // Add logging

    if (!students || students.length === 0) {
      return res.status(404).json({
        message: "Students not found",
        success: false,
      });
    }
    return res.status(200).json({
      students,
      success: true,
    });
  } catch (error) {
    console.error("Error in getAllStuBySensei function:", error);
    return res.status(500).json({
      message: "Something went wrong at getAllStuBySensei",
      success: false,
    });
  }
};


module.exports = {
  registerStu,
  getStudent,
  getStudentById,
  updateStudent,
  getAllStu,
  getAllStuBySensei,
};
