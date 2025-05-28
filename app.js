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
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.get("/", (req, res) => {
  res.setHeader("Content-Type", "text/html");
  let authStatus = "Logged Out";
  let profileLink = "";
  if (req.isAuthenticated && req.isAuthenticated()) {
      authStatus = `Logged In as ${req.user.displayName}`;
      profileLink = `<p><a href="/auth/profile">View Profile (Session)</a></p>`;
  }

  res.status(200).send(`
    <h1>(╯°□°）╯︵ ┻━┻ - API Home</h1>
    <p>Welcome to the API.</p>
    <p><a href="/auth/google">Login with Google</a></p>
    <p><a href="/auth/logout">Logout</a></p>
    <p>Status: ${authStatus}</p>
    ${profileLink}
    <p><a href="/api-docs">API Documentation (Swagger)</a></p>
  `);
});


app.use("/auth", authRoutes); 
app.use("/api", contactRoutes);
app.use("/api", productRoutes);


swaggerSetup(app);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}. Access API docs at /api-docs`));