// models/userModel.js
const mongoose = require("mongoose");
// const bcrypt = require('bcryptjs'); // For local password hashing if implemented

const userSchema = new mongoose.Schema({
  googleId: {
    type: String,
    unique: true,
    sparse: true, // Allows multiple documents to have a null value for this field if not signed in with Google
  },
  displayName: {
    type: String,
  },
  firstName: {
    type: String,
  },
  lastName: {
    type: String,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  // profilePhoto: { // Optional: if you want to store profile photo URL
  //   type: String,
  // },
  // password: { // Uncomment and use with bcrypt if you add local username/password authentication
  //   type: String,
  //   // required: function() { return !this.googleId; } // Password required if not a Google user
  // },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// // Example pre-save hook for hashing password if local auth is added
// userSchema.pre('save', async function(next) {
//   if (!this.isModified('password') || !this.password) {
//     return next();
//   }
//   try {
//     const salt = await bcrypt.genSalt(10);
//     this.password = await bcrypt.hash(this.password, salt);
//     next();
//   } catch (err) {
//     next(err);
//   }
// });

// // Example method to compare password if local auth is added
// userSchema.methods.comparePassword = async function(candidatePassword) {
//   if (!this.password) return false;
//   return bcrypt.compare(candidatePassword, this.password);
// };


const User = mongoose.model("User", userSchema);

module.exports = User;