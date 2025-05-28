// routes/productRoutes.js
const express = require("express");
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
} = require("../controllers/productController");
const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Product:
 *       type: object
 *       required:
 *         - name
 *         - description
 *         - price
 *         - category
 *         - stockQuantity
 *         - sku
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated MongoDB ID of the product
 *           example: "60d0fe4f5311236168a109cb"
 *         name:
 *           type: string
 *           description: Name of the product
 *           example: "Super Laptop Pro"
 *         description:
 *           type: string
 *           description: Detailed description of the product
 *           example: "Latest generation super fast laptop with AI capabilities"
 *         price:
 *           type: number
 *           format: float
 *           description: Price of the product in USD
 *           example: 1299.99
 *           minimum: 0
 *         category:
 *           type: string
 *           description: Category of the product
 *           example: "Electronics"
 *         stockQuantity:
 *           type: integer
 *           description: Available stock quantity
 *           example: 50
 *           minimum: 0
 *         supplier:
 *           type: string
 *           description: Supplier of the product (optional)
 *           example: "TechCorp Inc."
 *         sku:
 *           type: string
 *           description: Stock Keeping Unit, unique identifier for the product (uppercase)
 *           example: "SLP-2024-001A"
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *           description: Tags associated with the product (optional)
 *           example: ["new", "high-performance", "laptop", "AI"]
 *         releaseDate:
 *           type: string
 *           format: date
 *           description: Product release date (optional)
 *           example: "2024-01-15"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Timestamp of when the product was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Timestamp of when the product was last updated
 *
 *   requestBodies:
 *     ProductPostBody:
 *       description: Product object that needs to be added. `id`, `createdAt`, `updatedAt` are server-generated.
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - description
 *               - price
 *               - category
 *               - stockQuantity
 *               - sku
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Super Laptop Pro"
 *               description:
 *                 type: string
 *                 example: "Latest generation super fast laptop with AI capabilities"
 *               price:
 *                 type: number
 *                 format: float
 *                 example: 1299.99
 *               category:
 *                 type: string
 *                 example: "Electronics"
 *               stockQuantity:
 *                 type: integer
 *                 example: 50
 *               supplier:
 *                 type: string
 *                 example: "TechCorp Inc."
 *               sku:
 *                 type: string
 *                 example: "SLP-2024-001A"
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["new", "high-performance"]
 *               releaseDate:
 *                 type: string
 *                 format: date
 *                 example: "2024-01-15"
 *     ProductPutBody:
 *       description: Product object fields to update. Only include fields that need to be changed.
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties: # All fields are optional for PUT
 *               name:
 *                 type: string
 *                 example: "Super Laptop Pro v2"
 *               description:
 *                 type: string
 *                 example: "Upgraded version of the super fast laptop"
 *               price:
 *                 type: number
 *                 format: float
 *                 example: 1349.99
 *               category:
 *                 type: string
 *                 example: "Premium Electronics"
 *               stockQuantity:
 *                 type: integer
 *                 example: 45
 *               supplier:
 *                 type: string
 *                 example: "TechCorp Global"
 *               sku:
 *                 type: string
 *                 example: "SLP-2024-001B" # Must remain unique if changed
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["upgraded", "high-performance", "laptop", "AI-enhanced"]
 *               releaseDate:
 *                 type: string
 *                 format: date
 *                 example: "2024-03-01"
 */

/**
 * @swagger
 * tags:
 *   name: Products
 *   description: API for managing products in the store
 */

// --- Product Routes ---

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Retrieve a list of all products
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: Successfully retrieved a list of products.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 *       500:
 *         description: Internal server error while fetching products.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */
router.get("/products", getProducts);

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: Get a single product 
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *           format: objectId
 *         required: true
 *         description: The MongoDB ID of the product to retrieve.
 *     responses:
 *       200:
 *         description: Successfully retrieved the product.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       400:
 *         description: Invalid product ID format.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       404:
 *         description: Product not found with the provided ID.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       500:
 *         description: Internal server error while fetching the product.
 */
router.get("/products/:id", getProductById);

/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Create a new product
 *     tags: [Products]
 *     requestBody:
 *       $ref: '#/components/requestBodies/ProductPostBody'
 *     responses:
 *       201:
 *         description: Product created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       400:
 *         description: Bad Request. Invalid input, missing required fields, validation error (e.g., SKU already exists, price negative).
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 errors: # Optional, for Mongoose validation errors
 *                   type: object
 *                   additionalProperties:
 *                     type: string
 *       500:
 *         description: Internal server error while creating the product.
 */
router.post("/products", createProduct);

/**
 * @swagger
 * /api/products/{id}:
 *   put:
 *     summary: Update an existing product 
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *           format: objectId
 *         required: true
 *         description: The MongoDB ID of the product to update.
 *     requestBody:
 *       $ref: '#/components/requestBodies/ProductPutBody'
 *     responses:
 *       200:
 *         description: Product updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       400:
 *         description: Bad Request. Invalid product ID format, no update data provided, or validation error (e.g., SKU exists, price negative).
 *       404:
 *         description: Product not found with the provided ID.
 *       500:
 *         description: Internal server error while updating the product.
 */
router.put("/products/:id", updateProduct);

/**
 * @swagger
 * /api/products/{id}:
 *   delete:
 *     summary: Delete a product 
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *           format: objectId
 *         required: true
 *         description: The MongoDB ID of the product to delete.
 *     responses:
 *       200:
 *         description: Product deleted successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Product deleted successfully
 *                 deletedProduct:
 *                   $ref: '#/components/schemas/Product'
 *       400:
 *         description: Invalid product ID format.
 *       404:
 *         description: Product not found. Cannot delete.
 *       500:
 *         description: Internal server error while deleting the product.
 */
router.delete("/products/:id", deleteProduct);

module.exports = router;