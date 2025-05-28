// controllers/productController.js
const Product = require("../models/productModel");
const mongoose = require("mongoose");

const formatValidationErrors = (err) => {
  const errors = {};
  for (let field in err.errors) {
    errors[field] = err.errors[field].message;
  }
  return errors;
};

// Get all products
exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).json(products);
  } catch (err) {
    console.error("Error in getProducts:", err);
    res.status(500).json({ message: "Error fetching products: " + err.message });
  }
};

// Get a single product by ID
exports.getProductById = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid product ID format" });
  }

  try {
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.status(200).json(product);
  } catch (err) {
    console.error(`Error in getProductById for ID ${id}:`, err);
    res.status(500).json({ message: "Error fetching product: " + err.message });
  }
};

// Create a new product
exports.createProduct = async (req, res) => {
  const { name, description, price, category, stockQuantity, supplier, sku, tags, releaseDate } = req.body;


  const requiredFields = { name, description, price, category, stockQuantity, sku };
  const missingFields = Object.keys(requiredFields).filter(key => requiredFields[key] === undefined || requiredFields[key] === '');
  
  if (missingFields.length > 0) {
    return res.status(400).json({ message: `Missing required fields: ${missingFields.join(', ')}` });
  }

  if (typeof price !== 'number' || price < 0) {
    return res.status(400).json({ message: "Price must be a non-negative number." });
  }
  if (typeof stockQuantity !== 'number' || stockQuantity < 0) {
    return res.status(400).json({ message: "Stock quantity must be a non-negative integer." });
  }

  try {
    const newProduct = new Product({
      name,
      description,
      price,
      category,
      stockQuantity,
      supplier,
      sku,
      tags,
      releaseDate
    });
    await newProduct.save();
    res.status(201).json(newProduct);
  } catch (err) {
    console.error("Error in createProduct:", err);
    if (err.name === 'ValidationError') {
      return res.status(400).json({ message: "Validation Error", errors: formatValidationErrors(err) });
    }
    if (err.code === 11000) {
      const field = Object.keys(err.keyValue)[0];
      const value = err.keyValue[field];
      return res.status(400).json({ message: `Error creating product: ${field} '${value}' already exists.` });
    }
    res.status(500).json({ message: "Error creating product: " + err.message });
  }
};

// Update an existing product
exports.updateProduct = async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid product ID format" });
  }

  if (Object.keys(updateData).length === 0) {
    return res.status(400).json({ message: "No update data provided. Please provide at least one field to update." });
  }

  // Specific validation for fields if they are present in the update
  if (updateData.price !== undefined && (typeof updateData.price !== 'number' || updateData.price < 0)) {
    return res.status(400).json({ message: "If updating price, it must be a non-negative number." });
  }
  if (updateData.stockQuantity !== undefined && (typeof updateData.stockQuantity !== 'number' || updateData.stockQuantity < 0 || !Number.isInteger(updateData.stockQuantity))) {
    return res.status(400).json({ message: "If updating stock quantity, it must be a non-negative integer." });
  }
  if (updateData._id) {
    delete updateData._id;
  }


  try {
    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true, context: 'query' }
    );

    if (!updatedProduct) {
      return res.status(404).json({ message: "Product not found with the provided ID." });
    }
    res.status(200).json(updatedProduct);
  } catch (err) {
    console.error(`Error in updateProduct for ID ${id}:`, err);
    if (err.name === 'ValidationError') {
      return res.status(400).json({ message: "Validation Error during update", errors: formatValidationErrors(err) });
    }
    if (err.code === 11000) {
      const field = Object.keys(err.keyValue)[0];
      const value = err.keyValue[field];
      return res.status(400).json({ message: `Error updating product: ${field} '${value}' already exists for another product.` });
    }
    res.status(500).json({ message: "Error updating product: " + err.message });
  }
};

// Delete a product
exports.deleteProduct = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid product ID format" });
  }

  try {
    const deletedProduct = await Product.findByIdAndDelete(id);

    if (!deletedProduct) {
      return res.status(404).json({ message: "Product not found. Cannot delete." });
    }
    res.status(200).json({ message: "Product deleted successfully", deletedProduct });
  } catch (err) {
    console.error(`Error in deleteProduct for ID ${id}:`, err);
    res.status(500).json({ message: "Error deleting product: " + err.message });
  }
};