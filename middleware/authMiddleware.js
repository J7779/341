// middleware/authMiddleware.js
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const dotenv = require("dotenv");

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

exports.isAuthenticated = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, JWT_SECRET);

      // Attach user to request object
      // req.user stores the payload which is { id: user._id } from authRoutes
      req.user = await User.findById(decoded.id).select("-password"); // Exclude password if it exists

      if (!req.user) {
        return res.status(401).json({ message: "Not authorized, user not found" });
      }
      next();
    } catch (error) {
      console.error("Token verification error:", error.message);
      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({ message: "Not authorized, token failed (invalid signature)" });
      }
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ message: "Not authorized, token expired" });
      }
      return res.status(401).json({ message: "Not authorized, token failed" });
    }
  }

  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }
};