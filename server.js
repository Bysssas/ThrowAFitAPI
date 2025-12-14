import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import itemRoutes from "./routes/itemRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import fitRoutes from "./routes/fitRoutes.js";

import { v2 as cloudinary } from "cloudinary";

dotenv.config();

// --- Cloudinary Global Config ---
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// --- Database Connection ---
// connectDB(); // Temporarily commented out to test server startup

const app = express();

// --- CORS Setup ---
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

// --- Body Parser ---
app.use(express.json());

// --- Routes ---
app.use("/api/items", itemRoutes);    // Make sure itemRoutes includes DELETE /:id
app.use("/api/upload", uploadRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/fit", fitRoutes);

// --- Root Route ---
app.get("/", (req, res) => {
  res.send("Throw-A-Fit API is running.");
});

// --- 404 Handler ---
app.use((req, res, next) => {
  res.status(404).json({ message: "Route not found" });
});

// --- Error Handling Middleware ---
app.use((err, req, res, next) => {
  console.error(err.stack);
  const status = err.status || 500;
  res.status(status).json({ message: err.message || "Server Error" });
});

// --- Start Server ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
