const contactusModel = require("../models/contactus-model");

const addContactusData = async (req, res) => {
    try {
        const newContact = new contactusModel(req.body);
        await newContact.save();
        return res.status(201).json({
            message: "Contact information saved successfully",
            success: true,
            data: newContact,
        });
    } catch (error) {
        console.error(error);
        return res.status(400).json({
            message: "Failed to save contact information",
            success: false,
            error: error.message,
        });
    }
};

const getContactusData = async (req, res) => {
    try {
      const clients = await contactusModel.find(); // Assuming you meant 'clients'
      return res.status(200).json({
        message: "Success",
        clients, // Respond with 'clients'
        success: true,
      });
    } catch (error) {
      console.error(error); // Improved logging
      return res.status(500).json({
        message: "Something went wrong",
        success: false,
      });
    }
};

module.exports = { getContactusData, addContactusData };
