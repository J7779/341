// models/productModel.js
const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Product name is required"],
    trim: true,
  },
  description: {
    type: String,
    required: [true, "Product description is required"],
  },
  price: {
    type: Number,
    required: [true, "Product price is required"],
    min: [0, "Price cannot be negative"],
  },
  category: {
    type: String,
    required: [true, "Product category is required"],
    trim: true,
  },
  stockQuantity: {
    type: Number,
    required: [true, "Stock quantity is required"],
    min: [0, "Stock quantity cannot be negative"],
    default: 0,
  },
  supplier: {
    type: String,
    trim: true,
  },
  sku: { 
    type: String,
    required: [true, "Product SKU is required"],
    unique: true,
    trim: true,
    uppercase: true,
  },
  tags: { 
    type: [String],
    default: []
  },
  releaseDate: {
    type: Date
  },
}, { timestamps: true });

module.exports = mongoose.model("Product", productSchema);