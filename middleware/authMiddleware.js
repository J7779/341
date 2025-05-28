
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const dotenv = require("dotenv");

dotenv.config(); 

const JWT_SECRET = process.env.JWT_SECRET;

exports.isAuthenticated = async (req, res, next) => {
  let tokenToVerify;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    try {
      tokenToVerify = req.headers.authorization.split(" ")[1];
      console.log('--- Auth Middleware ---');
      console.log('Received Authorization Header:', req.headers.authorization);
      console.log('Token extracted for verification:', tokenToVerify);
      console.log('Secret used for verification (inside isAuthenticated):', JWT_SECRET);
      console.log('Type of JWT_SECRET:', typeof JWT_SECRET);
      console.log('Length of JWT_SECRET:', JWT_SECRET ? JWT_SECRET.length : 'undefined');


      if (!JWT_SECRET || typeof JWT_SECRET !== 'string' || JWT_SECRET.length < 10) {
          console.error('CRITICAL: JWT_SECRET is invalid or too short in isAuthenticated!');
          return res.status(500).json({ message: "Server configuration error: JWT Secret invalid." });
      }

      const decoded = jwt.verify(tokenToVerify, JWT_SECRET);

      console.log('Token successfully decoded:', decoded);

      req.user = await User.findById(decoded.id).select("-password");

      if (!req.user) {
        console.log('User not found in DB with decoded ID:', decoded.id);
        return res.status(401).json({ message: "Not authorized, user not found" });
      }
      next();
    } catch (error) {
      console.error('--- ERROR in Auth Middleware ---');
      console.error('Error during token verification:', error.name, error.message);
      console.error('Token that failed verification:', tokenToVerify);
      console.error('Secret used during failed verification:', JWT_SECRET);

      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({ message: `Not authorized, token failed (${error.message})` });
      }
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ message: "Not authorized, token expired" });
      }
      return res.status(401).json({ message: "Not authorized, general token failure" });
    }
  } else {
    console.log('--- Auth Middleware ---');
    console.log('No Authorization header or incorrect format.');
    return res.status(401).json({ message: "Not authorized, no token or malformed header" });
  }


  if (!tokenToVerify) {
    console.log('--- Auth Middleware ---');
    console.log('No token found after checks.');
    return res.status(401).json({ message: "Not authorized, no token provided" });
  }
};