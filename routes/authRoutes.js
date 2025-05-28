// routes/authRoutes.js
const express = require("express");
const passport = require("passport");
const jwt = require("jsonwebtoken");
const { isAuthenticated } = require("../middleware/authMiddleware");
const router = express.Router();
const dotenv = require("dotenv");

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;
const API_URL = process.env.API_URL || "http://localhost:5000"; // Your API's base URL

// Helper to generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, JWT_SECRET, {
    expiresIn: "1d",
  });
};

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: User authentication and authorization
 */

/**
 * @swagger
 * /auth/google:
 *   get:
 *     summary: Initiate Google OAuth login
 *     tags: [Authentication]
 *     responses:
 *       302:
 *         description: Redirect to Google's OAuth server.
 */
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

/**
 * @swagger
 * /auth/google/callback:
 *   get:
 *     summary: Google OAuth callback URL
 *     tags: [Authentication]
 *     description: Handles the callback from Google. If successful, issues a JWT and redirects to the API's main page with the token as a query parameter.
 *     responses:
 *       302:
 *         description: Redirects to API main page with token in query parameter.
 *       401:
 *         description: Authentication failed.
 */
router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: `${API_URL}/auth/failed`, // Redirect within API for failure
    session: false,
  }),
  (req, res) => {
    (req, res) => {
    if (!req.user) {
      return res.redirect(`${API_URL}/auth/failed?error=authentication_failed`);
    }
    console.log('Signing with JWT_SECRET:', process.env.JWT_SECRET); // DEBUG
    const token = generateToken(req.user._id);
}
    // --- MODIFICATION START ---
    // Redirect to the API's main page (root) with the token as a query parameter.
    res.redirect(`${API_URL}/api-docs?token=${token}`);
    // You can add other query params like a success message if you want.
    // Note: The root route '/' in app.js will need to handle this token.
    // --- MODIFICATION END ---
  }
);

/**
 * @swagger
 * /auth/logout:
 *   get:
 *     summary: Log out the user
 *     tags: [Authentication]
 *     responses:
 *       200:
 *         description: Logout successful.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */
router.get("/logout", (req, res, next) => {
  req.logout(function(err) {
    if (err) { return next(err); }
    // Redirect to API home page after logout
    res.redirect(`${API_URL}/?message=Logged%20Out`);
  });
});

/**
 * @swagger
 * /auth/profile:
 *   get:
 *     summary: Get current user's profile (protected by JWT)
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile data.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: Not authorized.
 */
router.get("/profile", isAuthenticated, (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: "Not authorized" });
  }
  res.status(200).json(req.user);
});

// Failure page within the API
router.get("/failed", (req, res) => {
  const errorMessage = req.query.error || "Google authentication failed. Please try again.";
  res.status(401).send(`
    <h1>Authentication Failed</h1>
    <p>${decodeURIComponent(errorMessage)}</p>
    <p><a href="${API_URL || '/'}">Go to Home</a></p>
  `);
});

module.exports = router;