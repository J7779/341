const Contact = require("../models/contactModel");

exports.getContacts = async (req, res) => {
  try {
    const contacts = await Contact.find();
    res.json(contacts);
  } catch (err) {
    res.status(500).json({ message: "Error fetching contacts: " + err.message });
  }
};

exports.createContact = async (req, res) => {
  const { firstName, lastName, email, favoriteColor } = req.body;

  if (!firstName || !lastName || !email || !favoriteColor) {
    return res.status(400).json({ message: "Missing required fields: firstName, lastName, email, favoriteColor" });
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
    if (err.code === 11000) {
       return res.status(400).json({ message: "Error creating contact: Email already exists." });
    }
    res.status(400).json({ message: "Error creating contact: " + err.message });
  }
};

exports.updateContact = async (req, res) => {
  const { id } = req.params;
  const { firstName, lastName, email, favoriteColor } = req.body;

  const updateData = {};
  if (firstName !== undefined) updateData.firstName = firstName;
  if (lastName !== undefined) updateData.lastName = lastName;
  if (email !== undefined) updateData.email = email;
  if (favoriteColor !== undefined) updateData.favoriteColor = favoriteColor;

  if (Object.keys(updateData).length === 0) {
    return res.status(400).json({ message: "No update data provided." });
  }

  try {
    const updatedContact = await Contact.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedContact) {
      return res.status(404).json({ message: "Contact not found" });
    }
    res.json(updatedContact);
  } catch (err) {
     if (err.code === 11000) {
       return res.status(400).json({ message: "Error updating contact: Email already exists for another contact." });
    }
    if (err.kind === 'ObjectId') {
         return res.status(400).json({ message: "Invalid ID format" });
    }
    res.status(400).json({ message: "Error updating contact: " + err.message });
  }
};

exports.deleteContact = async (req, res) => {
  const { id } = req.params;
  try {
    const deletedContact = await Contact.findByIdAndDelete(id);

    if (!deletedContact) {
      return res.status(404).json({ message: "Contact not found" });
    }
    res.json({ message: "Contact deleted successfully" });
  } catch (err) {
     if (err.kind === 'ObjectId') {
         return res.status(400).json({ message: "Invalid ID format" });
    }
    res.status(500).json({ message: "Error deleting contact: " + err.message });
  }
};

exports.getContactById = async (req, res) => {
    const { id } = req.params;
    try {
        const contact = await Contact.findById(id);
        if (!contact) {
            return res.status(404).json({ message: "Contact not found" });
        }
        res.json(contact);
    } catch (err) {
        if (err.kind === 'ObjectId') {
             return res.status(400).json({ message: "Invalid ID format" });
        }
        res.status(500).json({ message: "Error fetching contact: " + err.message });
    }
};