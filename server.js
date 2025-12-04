import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import itemRoutes from "./routes/itemRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import authRoutes from "./routes/authRoutes.js";
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
const productionOrigin = process.env.CORS_ORIGIN;
const localOrigin = "http://localhost:3000";
const allowedOrigins = [productionOrigin, localOrigin].filter(Boolean);

console.log("Allowed CORS origins:", allowedOrigins);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true); // allow Postman/curl
      if (allowedOrigins.includes(origin)) callback(null, true);
      else {
        console.error("CORS blocked:", origin);
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// --- Body parser ---
app.use(express.json());

// --- Routes ---
app.use("/api/items", itemRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/auth", authRoutes);

// --- Root Test Route ---
app.get("/", (req, res) => {
  res.send("Throw-A-Fit API is running.");
});

// --- Error Handling Middleware ---
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: err.message });
});

// --- PORT ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
