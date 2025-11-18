import express from "express";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js"; 

const router = express.Router();

// Set up Cloudinary storage
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "ThrowAFit", 
    allowed_formats: ["jpg", "png", "jpeg"],
     // You might want to add a transformation to enforce max size, though multer handles it too
  },
});

// Multer setup using the Cloudinary storage
// We will NOT define the upload variable globally, but use it in the route
const upload = multer({ storage }); 

// Upload endpoint
router.post("/", (req, res) => {
    // ➡️ 1. Wrap the upload function in a proper handler
    upload.single("image")(req, res, (err) => {
        
        // ➡️ 2. Check for the Multer/Cloudinary Error
        if (err instanceof multer.MulterError) {
            // A Multer error occurred (e.g., file size limit)
            console.error("Multer Error:", err.message);
            // Send a response that will now be handled by the global CORS middleware 
            // *before* the browser sees it.
            return res.status(400).json({ message: `❌ Multer Error: ${err.message}` });
        } else if (err) {
            // Other errors (e.g., Cloudinary connection/auth failure)
            console.error("Cloudinary/Other Upload Error:", err.message);
            
            // 💡 CRITICAL CHECK: If you are using the manual CORS, 
            // make sure the global middleware is hit for this error response.
            // If the error response still blocks, it's a deployment or global ordering issue.
            return res.status(500).json({ message: `❌ Upload Failed: ${err.message}` });
        }

        // 3. Success Path (Same as before)
        if (!req.file) {
            // This case should be rare if Multer executes correctly
            return res.status(400).json({ message: "❌ Image upload failed. File was not processed." });
        }
        
        // Success response
        res.json({
            message: "✅ Image uploaded successfully!",
            imageUrl: req.file.path, 
        });
    });
});
// ... (rest of your file)

export default router;