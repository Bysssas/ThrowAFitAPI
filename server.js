import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import uploadRoute from "./routes/upload.js";

dotenv.config();

const app = express();

// 🔥 1. ENABLE CORS FOR ALL ROUTES (MUST BE AT THE TOP)
app.use(cors({
  origin: ["https://serene-eclair-9ae22f.netlify.app", "*"],
  methods: "GET,POST,PUT,DELETE",
  allowedHeaders: "Content-Type,Authorization",
}));

// Optional manual CORS header (also safe)
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "https://serene-eclair-9ae22f.netlify.app");
  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE");
  res.header("Access-Control-Allow-Headers", "Content-Type,Authorization");
  next();
});

// 🔥 2. Body parser AFTER CORS
app.use(express.json());

// 🔥 3. Your routes AFTER CORS
app.use("/api/upload", uploadRoute);

// Health check
app.get("/", (req, res) => {
  res.send("Server is running.");
});

const port = process.env.PORT || 10000;

app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});
