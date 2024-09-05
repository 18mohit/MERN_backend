const express = require("express");
const router = express.Router();
const { addContactusData, getContactusData } = require("../controllers/contactusController");

router.get("/allData", getContactusData);
router.post("/create", addContactusData);

module.exports = router;
