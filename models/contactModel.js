const mongoose = require("mongoose");

const contactschema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  favoriteColor: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("Contact", contactschema);
