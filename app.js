
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const contactRoutes = require("./routes/contactRoutes"); 
const swaggerSetup = require("./config/swagger");

dotenv.config();

const app = express();


app.use((req, res, next) => {
  const allowedOrigin =
    process.env.NODE_ENV === "production" ? "https://three41-ucb0.onrender.com" : "http://localhost:8080";
  res.setHeader("Access-Control-Allow-Origin", allowedOrigin);
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  next();
});

// Connect to MongoDB
connectDB();

// Middleware
app.use(bodyParser.json());
app.use(cors());


app.get("/", (req, res) => {
  res.setHeader('Content-Type', 'text/plain');
  res.status(200).send("(╯°□°）╯︵ ┻━┻");
});


app.use("/api", contactRoutes);


swaggerSetup(app);
const host = process.env.HOST || "localhost";
const port = process.env.PORT || 5000;


app.listen(port, () => console.log(`app connected to DB and listening on ${host}:${port}`));