// itemRoutes.js

import express from "express";
import { getItems, createItem } from "../controllers/itemController.js";

const router = express.Router();

// GET all items
router.get("/", getItems);

// ❌ CONSIDER REMOVING OR COMMENTING OUT THIS LINE:
// router.post("/", createItem); 

// ... rest of the file