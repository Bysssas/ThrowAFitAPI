import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import itemRoutes from "./routes/itemRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import { v2 as cloudinary } from "cloudinary";

// 1. Load environment variables first
dotenv.config();

// 2. Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

connectDB();

const app = express();

// --- CRITICAL FIX BELOW ---
// The origin causing the CORS block is your Netlify frontend.
const allowedOrigin = 'https://serene-eclair-9ae22f.netlify.app';
const corsOptions = {
    // Explicitly set the origin that is allowed to make requests
    origin: allowedOrigin,
};

// Apply the specific CORS options to allow your Netlify frontend
app.use(cors(corsOptions)); 

// --- END CRITICAL FIX ---

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