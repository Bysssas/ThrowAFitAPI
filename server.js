import express from "express";
import dotenv from "dotenv";
// REMOVE: import cors from "cors"; // <-- Removed the import
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

// --- START MANUAL CORS CONFIGURATION ---

// Define your frontend origin
const allowedOrigin = 'https://serene-eclair-9ae22f.netlify.app/upload';

app.use((req, res, next) => {
    // 1. Set the specific origin header
    res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
    
    // 2. Set the allowed methods
    res.setHeader(
        'Access-Control-Allow-Methods', 
        'GET, POST, OPTIONS, PUT, PATCH, DELETE'
    );
    
    // 3. Set the allowed headers (important for JSON and custom headers)
    res.setHeader(
        'Access-Control-Allow-Headers', 
        'Content-Type, Authorization, X-Requested-With'
    );

    // 4. Allow credentials (if you are sending cookies or auth tokens)
    res.setHeader('Access-Control-Allow-Credentials', true);
    
    // Handle "preflight" requests (OPTIONS method)
    // The browser sends an OPTIONS request before POST/PUT/DELETE requests 
    // to check permissions.
    if (req.method === 'OPTIONS') {
        // End the response here with a 200 status code
        return res.sendStatus(200); 
    }

    // Continue to the next middleware/route
    next();
});

// --- END MANUAL CORS CONFIGURATION ---

// Middleware
// REMOVE: app.use(cors()); // <-- Removed the package middleware

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