const express = require("express");
const {
  getContacts,
  createContact,
  updateContact,
  deleteContact,
  getContactById
} = require("../controllers/contactController");
const { isAuthenticated } = require("../middleware/authMiddleware"); // Import auth middleware
const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Contact:
 *       type: object
 *       required:
 *         - firstName
 *         - lastName
 *         - email
 *         - favoriteColor
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated MongoDB ID
 *         firstName:
 *           type: string
 *           description: The contact's first name
 *         lastName:
 *           type: string
 *           description: The contact's last name
 *         email:
 *           type: string
 *           format: email
 *           description: The contact's unique email address
 *         favoriteColor:
 *           type: string
 *           description: The contact's favorite color
 *       example:
 *         id: 60d0fe4f5311236168a109ca
 *         firstName: Jane
 *         lastName: Doe
 *         email: jane.doe@example.com
 *         favoriteColor: blue
 * # Note: securitySchemes is defined globally, usually in productRoutes.js or a central swagger config
 * # For clarity, if this file were processed independently for Swagger, you might repeat it or ensure it's loaded.
 */

/**
 * @swagger
 * tags:
 *   name: Contacts
 *   description: API for managing contacts
 */

/**
 * @swagger
 * /api/contacts:
 *   get:
 *     summary: Get all contacts
 *     tags: [Contacts]
 *     responses:
 *       200:
 *         description: A list of contacts
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Contact'
 *       500:
 *          description: Error fetching contacts
 */
router.get("/contacts", getContacts);

/**
 * @swagger
 * /api/contacts/{id}:
 *   get:
 *     summary: Get a single contact by ID
 *     tags: [Contacts]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The contact ID
 *     responses:
 *       200:
 *         description: The requested contact details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Contact'
 *       400:
 *         description: Invalid ID format
 *       404:
 *         description: Contact not found
 *       500:
 *         description: Error fetching contact
 */
router.get("/contacts/:id", getContactById);

/**
 * @swagger
 * /api/contacts:
 *   post:
 *     summary: Create a new contact (Protected)
 *     tags: [Contacts]
 *     security:
 *       - bearerAuth: [] # Indicates this route uses bearerAuth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Contact'
 *     responses:
 *       201:
 *         description: The contact was successfully created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Contact'
 *       400:
 *         description: Invalid input, object invalid, or missing required fields
 *       401:
 *         description: Unauthorized. Token is missing or invalid.
 *       500:
 *         description: Error creating contact
 */
router.post("/contacts", isAuthenticated, createContact); // Protected

/**
 * @swagger
 * /api/contacts/{id}:
 *   put:
 *     summary: Update an existing contact (Protected - assuming update also needs auth)
 *     tags: [Contacts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The contact ID to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Contact'
 *     responses:
 *       200:
 *         description: The contact was updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Contact'
 *       400:
 *         description: Invalid input, no update data provided, or validation error
 *       401:
 *         description: Unauthorized. Token is missing or invalid.
 *       404:
 *         description: Contact not found
 *       500:
 *         description: Error updating contact
 */
router.put("/contacts/:id", isAuthenticated, updateContact); // Protected (Decided to protect PUT as well)

/**
 * @swagger
 * /api/contacts/{id}:
 *   delete:
 *     summary: Delete a contact (Protected)
 *     tags: [Contacts]
 *     security:
 *       - bearerAuth: [] # Indicates this route uses bearerAuth
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The contact ID to delete
 *     responses:
 *       200:
 *         description: Contact deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Contact deleted successfully
 *       401:
 *         description: Unauthorized. Token is missing or invalid.
 *       404:
 *         description: Contact not found
 *       500:
 *         description: Error deleting contact
 */
router.delete("/contacts/:id", isAuthenticated, deleteContact); // Protected

module.exports = router;