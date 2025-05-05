const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {

    });
    console.log("MongoDB connected successfully.");

    const collectionName = "contacts";
    const db = mongoose.connection.db;


    const collections = await db.listCollections({ name: collectionName }).toArray();

    if (collections.length === 0) {

      console.log(`Collection '${collectionName}' not found. Creating...`);
      await db.createCollection(collectionName);
      console.log(`Collection '${collectionName}' created successfully.`);
    } else {

      console.log(`Collection '${collectionName}' already exists.`);
    }


  } catch (err) {
    console.error("MongoDB connection or collection check error:", err.message);
    process.exit(1); 
  }
};

module.exports = connectDB;