
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const contactRoutes = require("./routes/contactRoutes"); 
const swaggerSetup = require("./config/swagger");

dotenv.config();

const app = express();

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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));