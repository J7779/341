// app.js
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const dotenv = require("dotenv");
const session = require("express-session");
const passport = require("passport");

const connectDB = require("./config/db");
const contactRoutes = require("./routes/contactRoutes");
const productRoutes = require("./routes/productRoutes");
const authRoutes = require("./routes/authRoutes");
const swaggerSetup = require("./config/swagger");
require("./config/passport-setup");

dotenv.config();

const app = express();
const API_URL = process.env.API_URL || "http://localhost:5000";

// Connect to MongoDB
connectDB();

// Middleware
app.use(
  cors({
    origin: process.env.CLIENT_URL || "*",
    credentials: true,
  })
);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      // secure: process.env.NODE_ENV === "production",
      // httpOnly: true,
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.get("/", (req, res) => {
  res.setHeader("Content-Type", "text/html");

  // Check for token and message from query parameters (after OAuth redirect)
  const token = req.query.token;
  const message = req.query.message;

  let authStatus = "Logged Out";
  let profileLink = "";
  let tokenDisplay = "";

  // Passport's req.isAuthenticated() checks the session
  // For JWT based state, you'd typically rely on the client sending the token.
  // However, since we are redirecting here, the session might still be active from the OAuth flow.
  if (req.isAuthenticated && req.isAuthenticated()) {
      authStatus = `Logged In via session as ${req.user.displayName}`;
      profileLink = `<p><a href="${API_URL}/auth/profile">View Profile (Session Based - requires login if session expires)</a></p>
                     <p>To test JWT protected routes, use the token below with Postman or Swagger Authorize button.</p>`;
  }

  if (token) {
    authStatus = "Login Successful (JWT Issued)!"; // Overwrite if token is present
    tokenDisplay = `
      <h3>Your JWT Token:</h3>
      <p style="word-break: break-all;">${token}</p>
      <p><strong>Copy this token</strong> to use with API clients (like Postman or Swagger's "Authorize" button) for accessing protected routes.</p>
      <p>For example, set Header: <code>Authorization: Bearer ${token}</code></p>
    `;
  }

  let pageMessage = "";
  if (message) {
    pageMessage = `<p style="color: green;"><strong>Message:</strong> ${decodeURIComponent(message)}</p>`;
  }


  res.status(200).send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>API Home</title>
        <style>
            body { font-family: sans-serif; margin: 20px; }
            code { background-color: #f0f0f0; padding: 2px 5px; border-radius: 3px; }
            h3 { margin-top: 30px; }
        </style>
    </head>
    <body>
        <h1>(╯°□°）╯︵ ┻━┻</h1>
        ${pageMessage}
        <p><a href="${API_URL}/auth/google">Login with Google</a></p>
        <p><a href="${API_URL}/api-docs">API Documentation (Swagger)</a></p>
    </body>
    </html>
  `);
});

// Routes
app.use("/auth", authRoutes);
app.use("/api", contactRoutes);
app.use("/api", productRoutes);

swaggerSetup(app);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}. Access API docs at ${API_URL}/api-docs. Main page at ${API_URL}/`));