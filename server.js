import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import itemRoutes from "./routes/itemRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import { v2 as cloudinary } from "cloudinary";

// 1. Load environment variables first
dotenv.config();
console.log("MONGO_URI:", process.env.MONGO_URI);

// 2. Configure Cloudinary using loaded environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

connectDB();

const app = express();

// Middleware

// ✅ CORS FIX: Using simple app.use(cors()) which applies
// Access-Control-Allow-Origin: * to resolve the issue with Netlify.
app.use(cors()); 

app.use(express.json());

// Routes
app.use("/api/items", itemRoutes);
app.use("/api/upload", uploadRoutes);

// Root route for testing
app.get("/", (req, res) => {
  res.send("Throw-A-Fit API is running");
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));