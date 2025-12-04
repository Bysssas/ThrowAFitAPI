import express from "express";
import { auth } from "./authRoutes.js";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import path from "path";
import Item from "../models/Item.js";
import FormData from "form-data";
import axios from "axios";

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
      fs.unlinkSync(image.tempFilePath);
      return res.status(400).json({ message: "Name and category are required" });
    }

    // ─── Step 1: Remove Background using remove.bg API ───
    const formData = new FormData();
    formData.append("image_file", fs.createReadStream(image.tempFilePath));
    formData.append("size", "auto");

    const removeBgRes = await axios({
      method: "post",
      url: "https://api.remove.bg/v1.0/removebg",
      data: formData,
      headers: {
        ...formData.getHeaders(),
        "X-Api-Key": process.env.REMOVEBG_API_KEY, // set in .env
      },
      responseType: "arraybuffer",
    });

    // ─── Step 2: Save temp background-removed image ───
    const tempPath = path.join(".", `uploads/temp-${Date.now()}.png`);
    fs.writeFileSync(tempPath, removeBgRes.data);

    // ─── Step 3: Upload to Cloudinary ───
    const uploadResult = await cloudinary.uploader.upload(tempPath, {
      folder: "throw-a-fit",
      resource_type: "image",
    });

    // ─── Step 4: Cleanup temp files ───
    fs.unlinkSync(image.tempFilePath);
    fs.unlinkSync(tempPath);

    // ─── Step 5: Save item to DB ───
    const newItem = new Item({
      name,
      category,
      imageUrl: uploadResult.secure_url,
      user: req.user._id,
    });

    await newItem.save();

    res.status(201).json({ message: "Upload successful", item: newItem });
  } catch (err) {
    console.error("UPLOAD ERROR:", err);
    // Remove temp files if they exist
    if (req.files?.image?.tempFilePath && fs.existsSync(req.files.image.tempFilePath))
      fs.unlinkSync(req.files.image.tempFilePath);
    res.status(500).json({ message: err.message || "Server error during upload" });
  }
});

export default router;
