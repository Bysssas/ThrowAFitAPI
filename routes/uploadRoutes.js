import express from "express";
import { auth } from "./authRoutes.js";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import Item from "../models/Item.js";

const router = express.Router();

// POST /api/upload
router.post("/", auth, async (req, res) => {
  try {
    if (!req.files || !req.files.image) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const { image } = req.files;
    const { name, category } = req.body;

    if (!name || !category) {
      return res.status(400).json({ message: "Name and category are required" });
    }

    // Upload to Cloudinary
    const uploadResult = await cloudinary.uploader.upload(image.tempFilePath, {
      folder: "throw-a-fit",
      resource_type: "image",
    });

    // Remove temp file
    fs.unlinkSync(image.tempFilePath);

    // Save item to DB
    const newItem = new Item({
      name,
      category,
      imageUrl: uploadResult.secure_url,
      user: req.user._id, // associate with logged-in user
    });

    await newItem.save();

    res.status(201).json({ message: "Upload successful", item: newItem });
  } catch (err) {
    console.error("UPLOAD ERROR:", err);
    res.status(500).json({ message: err.message || "Server error during upload" });
  }
});

export default router;
