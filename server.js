import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import uploadRoute from ".uploadRoutes.js";

dotenv.config();

const app = express();

// 🌐 1. CORS (uses Render environment variable)
console.log("Allowed CORS origin:", process.env.CORS_ORIGIN);

app.use(cors({
  origin: process.env.CORS_ORIGIN,   // <-- uses your Render variable
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

// ❌ REMOVE manual headers completely (this breaks CORS)
// Do NOT include any Access-Control-Allow-Origin manually

// 📦 2. Body parser
app.use(express.json());

// 📁 3. Routes
app.use("/api/upload", uploadRoute);

// Test route
app.get("/", (req, res) => {
  res.send("Server is running.");
});

const port = process.env.PORT || 10000;

app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});
