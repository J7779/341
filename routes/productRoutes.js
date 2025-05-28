// routes/productRoutes.js
const express = require("express");
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
} = require("../controllers/productController");
const { isAuthenticated } = require("../middleware/authMiddleware"); // Import auth middleware
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
 *     User: # Added User schema for profile route example (already in your version)
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         googleId:
 *           type: string
 *         displayName:
 *           type: string
 *         firstName:
 *           type: string
 *         lastName:
 *           type: string
 *         email:
 *           type: string
 *           format: email
 *         createdAt:
 *           type: string
 *           format: date-time
 *
 *   requestBodies:
 *     ProductPostBody:
 *       description: Product object that needs to be added.
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             # ... (properties for ProductPostBody)
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
 *       description: Product object fields to update.
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             # ... (properties for ProductPutBody)
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               # ... other optional fields
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
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
 *         description: Internal server error.
 */
router.get("/products", getProducts);

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: Get a single product by ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the product.
 *     responses:
 *       200:
 *         description: Successfully retrieved the product.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       404:
 *         description: Product not found.
 *       500:
 *         description: Internal server error.
 */
router.get("/products/:id", getProductById);

/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Create a new product (Protected)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: [] # Indicates this route uses bearerAuth
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
 *         description: Bad Request. Invalid input.
 *       401:
 *         description: Unauthorized. Token is missing or invalid.
 *       500:
 *         description: Internal server error.
 */
router.post("/products", isAuthenticated, createProduct); // PROTECTED

/**
 * @swagger
 * /api/products/{id}:
 *   put:
 *     summary: Update an existing product (Protected)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: [] # Indicates this route uses bearerAuth
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the product to update.
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
 *         description: Bad Request. Invalid ID or input.
 *       401:
 *         description: Unauthorized. Token is missing or invalid.
 *       404:
 *         description: Product not found.
 *       500:
 *         description: Internal server error.
 */
router.put("/products/:id", isAuthenticated, updateProduct); // PROTECTED

/**
 * @swagger
 * /api/products/{id}:
 *   delete:
 *     summary: Delete a product (Protected)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: [] # Indicates this route uses bearerAuth
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the product to delete.
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
 *                 deletedProduct:
 *                   $ref: '#/components/schemas/Product'
 *       401:
 *         description: Unauthorized. Token is missing or invalid.
 *       404:
 *         description: Product not found.
 *       500:
 *         description: Internal server error.
 */
router.delete("/products/:id", isAuthenticated, deleteProduct);

module.exports = router;