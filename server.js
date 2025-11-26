import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import itemRoutes from "./routes/itemRoutes.js";   // ✔ must export default
import uploadRoutes from "./routes/uploadRoutes.js"; // ✔ name fixed
import { v2 as cloudinary } from "cloudinary";

dotenv.config();

// --- Cloudinary Global Config ---
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// --- Database ---
connectDB();

const app = express();

// --- CORS ---
const allowedOrigin = process.env.CORS_ORIGIN || "http://localhost:3000";
console.log("Allowed CORS origin:", allowedOrigin);

app.use(
  cors({
    origin: allowedOrigin,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

// --- Routes ---
app.use("/api/items", itemRoutes);
app.use("/api/upload", uploadRoutes);

// --- Root Test Route ---
app.get("/", (req, res) => {
  res.send("Throw-A-Fit API is running.");
});

// --- PORT ---
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
