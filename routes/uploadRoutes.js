import express from "express";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary"; 
import axios from "axios"; 
import Item from '../models/Item.js'; // ⬅️ IMPORT YOUR ITEM MODEL HERE

const router = express.Router();

// 1. Configure Multer for Memory Storage
const upload = multer({ 
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
}); 

// 2. The combined route handler
router.post("/", upload.single("image"), async (req, res) => {
    
    // Check for Multer/File Errors before processing
    if (!req.file || !req.file.buffer) {
        return res.status(400).json({ message: "❌ No file received or buffer missing." });
    }

    const fileBuffer = req.file.buffer;
    let removeBgApiResult;
    let cloudinaryResult;
    
    // Get item data from the form body (e.g., name and category)
    // NOTE: Data like name and category come through req.body
    const { name, category } = req.body; 

    // --- Validation Check ---
    if (!name || !category) {
        return res.status(400).json({ message: "❌ Missing item name or category in the form data." });
    }

    try {
        // --- STEP 1 & 2: Send to remove.bg API ---
        removeBgApiResult = await axios({
            method: 'post',
            url: 'https://api.remove.bg/v1.0/removebg',
            headers: {
                'X-Api-Key': process.env.REMOVE_BG_API_KEY, 
            },
            data: {
                image_file_b64: fileBuffer.toString('base64'), 
                size: 'auto',
                type: 'product',
            },
            responseType: 'arraybuffer'
        });

        // --- STEP 3 & 4: Upload processed image data to Cloudinary ---
        const processedImageBase64 = Buffer.from(removeBgApiResult.data).toString('base64');
        const dataUri = `data:image/png;base64,${processedImageBase64}`;

        cloudinaryResult = await cloudinary.uploader.upload(dataUri, {
            folder: "ThrowAFit",
            format: 'png', 
        });

        const imageUrl = cloudinaryResult.secure_url;

        // 🛑 NEW STEP: Save the Item to the MongoDB database
        const newItem = await Item.create({
            name: name,
            category: category,
            imageUrl: imageUrl, // ⬅️ Saving the URL here
        });

        // 5. Success Response
        res.status(201).json({
            message: "✅ Item created and image processed successfully!",
            item: newItem, // Send the saved database document
        });

    } catch (error) {
        console.error("Upload/Database Error:", error.message);
        
        if (error.response && error.response.data) {
            const apiError = Buffer.from(error.response.data).toString('utf8');
            console.error("remove.bg API Detail:", apiError);
            return res.status(error.response.status || 500).json({ 
                message: `❌ API Error during processing. Details: ${apiError.slice(0, 100)}...` 
            });
        }
        // Generic catch-all error
        return res.status(500).json({ message: "❌ Failed to process, upload, or save item." });
    }
});

export default router;