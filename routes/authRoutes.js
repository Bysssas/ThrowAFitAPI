import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import nodemailer from "nodemailer";
import User from "../models/userModel.js";
import verifyToken from "../middleware/verifyToken.js";

const router = express.Router();

// Configure nodemailer
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// -------- SIGNUP --------
router.post("/signup", async (req, res) => {
  try {
    const { username, password, email } = req.body;

    if (!username || !password || !email) {
      return res.status(400).json({ msg: "Username, password, and email are required" });
    }

    // Simple email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return res.status(400).json({ msg: "Invalid email format" });

    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) return res.status(400).json({ msg: "Username or email already taken" });

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ username, password: hashed, email });

    res.json({ msg: "Account created", userId: user._id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error during signup" });
  }
});

// -------- LOGIN --------
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ msg: "Username and password are required" });

    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ msg: "User not found" });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ msg: "Incorrect password" });

    const token = jwt.sign({ id: user._id, username: user.username }, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.json({
      msg: "Login success",
      token,
      user: { _id: user._id, username: user.username, email: user.email },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error during login" });
  }
});

// -------- GET CURRENT USER --------
router.get("/me", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ msg: "User not found" });
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error fetching user info" });
  }
});

// -------- UPDATE USERNAME --------
router.put("/update-name", verifyToken, async (req, res) => {
  try {
    const { username: newName } = req.body;
    if (!newName || !newName.trim()) return res.status(400).json({ msg: "New name is required" });

    const existingUser = await User.findOne({ username: newName });
    if (existingUser && existingUser._id.toString() !== req.user.id) {
      return res.status(400).json({ msg: "Username already taken" });
    }

    const user = await User.findByIdAndUpdate(req.user.id, { username: newName }, { new: true }).select("-password");
    if (!user) return res.status(404).json({ msg: "User not found" });

    res.json({ msg: "Username updated successfully", user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error updating username" });
  }
});

// -------- FORGOT PASSWORD --------
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ msg: "Email is required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: "No user with that email" });

    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = await bcrypt.hash(resetToken, 10);

    user.passwordResetToken = hashedToken;
    user.passwordResetExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}&id=${user._id}`;

    // Send email
    try {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: user.email,
        subject: "Password Reset Request",
        html: `<p>You requested a password reset.</p>
               <p>Click <a href="${resetLink}">here</a> to reset your password. Link expires in 1 hour.</p>`,
      });
    } catch (emailErr) {
      console.error("Email sending failed, reset link:", resetLink);
    }

    res.json({ msg: "Password reset email sent", userId: user._id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error during password reset" });
  }
});

// -------- RESET PASSWORD --------
router.post("/reset-password", async (req, res) => {
  try {
    const { userId, token, newPassword } = req.body;
    if (!userId || !token || !newPassword) return res.status(400).json({ msg: "All fields are required" });

    const user = await User.findById(userId);
    if (!user) return res.status(400).json({ msg: "Invalid user" });

    if (!user.passwordResetToken || Date.now() > user.passwordResetExpires) {
      return res.status(400).json({ msg: "Token expired or invalid" });
    }

    const isValid = await bcrypt.compare(token, user.passwordResetToken);
    if (!isValid) return res.status(400).json({ msg: "Invalid token" });

    user.password = await bcrypt.hash(newPassword, 10);
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    res.json({ msg: "Password reset successful" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error during password reset" });
  }
});

export default router;
