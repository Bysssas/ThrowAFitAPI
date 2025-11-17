import express from "express";
import { getItems, createItem } from "../controllers/itemController.js";

const router = express.Router();

// GET all items
router.get("/", getItems);

// POST a new item
router.post("/", createItem);

// GET items by category
router.get("/accessories", (req, res) => getItemsByCategory(req, res, "accessories"));
router.get("/tops", (req, res) => getItemsByCategory(req, res, "tops"));
router.get("/bottoms", (req, res) => getItemsByCategory(req, res, "bottoms"));
router.get("/shoes", (req, res) => getItemsByCategory(req, res, "shoes"));

// Helper function for category filtering
function getItemsByCategory(req, res, category) {
  getItems(req, res, category);
}

export default router;
