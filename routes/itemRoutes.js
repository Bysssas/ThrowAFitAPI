import express from "express";
import { getItems } from "../controllers/itemController.js";
// Note: createItem is removed from the import as it's no longer used here.

const router = express.Router();

// 🛑 Helper function for category filtering (defined here for simplicity)
function getItemsByCategory(req, res, category) {
    // You should modify your getItems in the controller to accept and use the category
    // For now, we pass the category to getItems, assuming it handles the filtering.
    // A better approach is often to define a specific controller function like getItemsByParam(req, res, param).
    getItems(req, res, category);
}

// GET all items (No Category Filter)
router.get("/", getItems);

// ❌ The POST / route is removed as item creation with uploads is handled by /api/upload

// GET items by category
router.get("/accessories", (req, res) => getItemsByCategory(req, res, "accessories"));
router.get("/tops", (req, res) => getItemsByCategory(req, res, "tops"));
router.get("/bottoms", (req, res) => getItemsByCategory(req, res, "bottoms"));
router.get("/shoes", (req, res) => getItemsByCategory(req, res, "shoes"));

export default router;