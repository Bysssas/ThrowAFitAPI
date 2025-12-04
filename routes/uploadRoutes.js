import express from "express";
import { auth } from "./authRoutes.js";
import { v2 as cloudinary } from "cloudinary";
import Item from "../models/Item.js";

const router = express.Router();

router.post("/", auth, async (req, res) => {
  try {
    const { name, category } = req.body;
    const file = req.files.image; // if using express-fileupload
    if (!file) return res.status(400).json({ message: "No file uploaded" });

    const uploadResult = await cloudinary.uploader.upload(file.tempFilePath);

    const newItem = new Item({
      name,
      category,
      imageUrl: uploadResult.secure_url,
      user: req.user._id, // 🔹 attach logged-in user
    });

    await newItem.save();
    res.status(201).json({ item: newItem });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

export default router;
