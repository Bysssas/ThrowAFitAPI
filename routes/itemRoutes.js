import express from "express";
import { getItems, deleteItem } from "../controllers/itemController.js";
import verifyToken from "../middleware/verifyToken.js";

const router = express.Router();

// ────────── Get all items for the logged-in user ──────────
router.get("/user", verifyToken, async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });
    await getItems(req, res);
  } catch (err) {
    console.error("Error fetching user items:", err);
    res.status(500).json({ message: "Server error fetching user items" });
  }
});

// ────────── Category-specific routes ──────────
router.get("/tops", verifyToken, async (req, res) => getItems(req, res, "tops"));
router.get("/bottoms", verifyToken, async (req, res) => getItems(req, res, "bottoms"));
router.get("/shoes", verifyToken, async (req, res) => getItems(req, res, "shoes"));
router.get("/accessories", verifyToken, async (req, res) => getItems(req, res, "accessories"));

// ────────── Default route: all items ──────────
router.get("/", verifyToken, async (req, res) => getItems(req, res));

// ────────── DELETE ITEM ──────────
// DELETE /api/items/:id
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });
    await deleteItem(req, res);
  } catch (err) {
    console.error("Error deleting item:", err);
    res.status(500).json({ message: "Server error deleting item" });
  }
});

export default router;
