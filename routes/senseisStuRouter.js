const express = require("express");
const router = express.Router();
const isAuthenticated = require("../middlewarse/isAuthenticated").default;
const {
  registerStu,
  getStudent,
  getStudentById,
  updateStudent,
  getAllStu,
  getAllStuBySensei,
  deleteBlackStu,
} = require("../controllers/sensei-studentController");
const uploadFields = require("../config/multer-config");
const authenticateToken = require("../middlewarse/authenticateToken");

router.post("/register", uploadFields, registerStu);
router.get("/get", getStudent);
router.get("/getAllStu", getAllStu);
router.get("/get/:id", getStudentById);
router.get("/get/student/:id", getAllStuBySensei);
router.put("/update/:id", updateStudent);
router.delete('/delete/:id', deleteBlackStu);

module.exports = router;
