// routes/authRoutes.js
const express = require("express");
const passport = require("passport");
const jwt = require("jsonwebtoken");
const { isAuthenticated } = require("../middleware/authMiddleware"); // For protecting /profile
const router = express.Router();
const dotenv = require("dotenv");

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:3000"; // Fallback client URL

// Helper to generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, JWT_SECRET, {
    expiresIn: "1d", // Token expires in 1 day
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
 *     description: Redirects the user to Google for authentication. After successful authentication, Google will redirect back to the callback URL.
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
 *     description: Handles the callback from Google after authentication. If successful, it issues a JWT and redirects the user (or sends the token).
 *     responses:
 *       200:
 *         description: Authentication successful, JWT issued. The response might be a redirect with the token or the token in the body.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: JWT token for authenticated sessions.
 *                 message:
 *                   type: string
 *                   example: Authentication successful!
 *                 user:
 *                   type: object
 *                   properties:
 *                      id:
 *                          type: string
 *                      displayName:
 *                          type: string
 *                      email:
 *                          type: string
 *       302:
 *         description: Redirects to client URL with token, or to a failure page.
 *       401:
 *         description: Authentication failed.
 *       500:
 *         description: Server error during authentication.
 */
router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: `${CLIENT_URL}/login?error=google_auth_failed`, // Redirect to client login page with error
    session: false, // We are not using server sessions for API auth, but JWT
  }),
  (req, res) => {
    // At this point, req.user is populated by Passport's verify callback
    if (!req.user) {
      return res.status(401).json({ message: "User authentication failed." });
    }

    const token = generateToken(req.user._id);

    // Option 1: Redirect to client with token in query param (common for web clients)
    // Be cautious with this method due to potential security risks if not handled correctly on the client (e.g., token leakage in browser history/logs)
    // res.redirect(`${CLIENT_URL}/auth/callback?token=${token}`);

    // Option 2: Send token in response body (good for SPAs or mobile clients)
    res.status(200).json({
      message: "Google authentication successful!",
      token: token,
      user: {
        id: req.user._id,
        displayName: req.user.displayName,
        email: req.user.email,
      },
    });

    // Option 3: Set token in a secure, HttpOnly cookie (more secure for web)
    // res.cookie('jwt', token, {
    //   httpOnly: true,
    //   secure: process.env.NODE_ENV === 'production', // only send over HTTPS in production
    //   sameSite: 'Strict', // Or 'Lax'
    //   maxAge: 24 * 60 * 60 * 1000 // 1 day
    // });
    // res.redirect(`${CLIENT_URL}/dashboard`); // Redirect to a dashboard or home page
  }
);

/**
 * @swagger
 * /auth/logout:
 *   get:
 *     summary: Log out the user
 *     tags: [Authentication]
 *     description: Clears the user's session (if any) and redirects. For JWT, client should delete the token.
 *     responses:
 *       200:
 *         description: Logout successful, client should clear token.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Logged out successfully. Please clear your token.
 *       302:
 *         description: Redirects to the client's login page or home page after logout.
 */
router.get("/logout", (req, res, next) => {
  req.logout(function(err) { // req.logout is from Passport, clears session
    if (err) { return next(err); }
    // For JWT, the client is responsible for clearing the token.
    // This endpoint mainly serves to clear any server-side session (if used)
    // and provide a confirmation/redirect.
    // res.redirect(CLIENT_URL + '/login');
    res.status(200).json({ message: "Logged out successfully. Client should clear the token." });
  });
});

/**
 * @swagger
 * /auth/profile:
 *   get:
 *     summary: Get current user's profile (protected)
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     description: Retrieves the profile of the currently authenticated user (using JWT).
 *     responses:
 *       200:
 *         description: User profile data.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User' # Assuming User schema is defined
 *       401:
 *         description: Not authorized, token missing or invalid.
 */
router.get("/profile", isAuthenticated, (req, res) => {
  // req.user is populated by the isAuthenticated middleware
  if (!req.user) {
    return res.status(401).json({ message: "Not authorized" });
  }
  res.status(200).json(req.user);
});

// A simple route to show if Google auth failed
router.get("/failed", (req, res) => {
  res.status(401).json({ message: "Google authentication failed. Please try again." });
});


module.exports = router;