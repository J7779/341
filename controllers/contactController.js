// controllers/contactController.js
const Contact = require("../models/contactModel");
const mongoose = require("mongoose"); // Import mongoose

exports.getContacts = async (req, res) => {
  try {
    const contacts = await Contact.find();
    res.status(200).json(contacts);
  } catch (err) {
    console.error("Error in getContacts:", err);
    res.status(500).json({ message: "Error fetching contacts: " + err.message });
  }
};

exports.getContactById = async (req, res) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: "Invalid contact ID format" });
    }
    try {
        const contact = await Contact.findById(id);
        if (!contact) {
            return res.status(404).json({ message: "Contact not found" });
        }
        res.status(200).json(contact);
    } catch (err) {
        console.error(`Error in getContactById for ID ${id}:`, err);
        res.status(500).json({ message: "Error fetching contact: " + err.message });
    }
};

exports.createContact = async (req, res) => {
  const { firstName, lastName, email, favoriteColor } = req.body;

  // Basic validation for required fields
  const requiredFields = { firstName, lastName, email, favoriteColor };
  const missingFields = Object.keys(requiredFields).filter(key => !requiredFields[key]);
  
  if (missingFields.length > 0) {
    return res.status(400).json({ message: `Missing required fields: ${missingFields.join(', ')}` });
  }

  try {
    const newContact = new Contact({
      firstName,
      lastName,
      email,
      favoriteColor,
    });
    await newContact.save();
    res.status(201).json(newContact);
  } catch (err) {
    console.error("Error in createContact:", err);
    if (err.code === 11000) { // Duplicate key error (likely email)
       return res.status(400).json({ message: "Error creating contact: Email already exists." });
    }
    if (err.name === 'ValidationError') {
      const errors = Object.values(err.errors).map(el => el.message);
      return res.status(400).json({ message: "Validation Error", errors });
    }
    res.status(500).json({ message: "Error creating contact: " + err.message });
  }
};

exports.updateContact = async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid contact ID format" });
  }

  if (Object.keys(updateData).length === 0) {
    return res.status(400).json({ message: "No update data provided." });
  }
  // Remove id from updateData if present to prevent trying to update the _id field
  if (updateData._id) delete updateData._id;


  try {
    const updatedContact = await Contact.findByIdAndUpdate(
      id,
      { $set: updateData }, // Use $set to only update provided fields
      { new: true, runValidators: true, context: 'query' }
    );

    if (!updatedContact) {
      return res.status(404).json({ message: "Contact not found" });
    }
    res.status(200).json(updatedContact);
  } catch (err) {
    console.error(`Error in updateContact for ID ${id}:`, err);
     if (err.code === 11000) { // Duplicate key error
       return res.status(400).json({ message: "Error updating contact: Email already exists for another contact." });
    }
    if (err.name === 'ValidationError') {
      const errors = Object.values(err.errors).map(el => el.message);
      return res.status(400).json({ message: "Validation Error during update", errors });
    }
    res.status(500).json({ message: "Error updating contact: " + err.message });
  }
};

exports.deleteContact = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid contact ID format" });
  }
  try {
    const deletedContact = await Contact.findByIdAndDelete(id);

    if (!deletedContact) {
      return res.status(404).json({ message: "Contact not found. Cannot delete." });
    }
    res.status(200).json({ message: "Contact deleted successfully", deletedContact });
  } catch (err) {
    console.error(`Error in deleteContact for ID ${id}:`, err);
    res.status(500).json({ message: "Error deleting contact: " + err.message });
  }
};