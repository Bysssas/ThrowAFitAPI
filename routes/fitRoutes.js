import express from "express";
import verifyToken from "../middleware/verifyToken.js";
import { generateFit } from "../controllers/fitController.js";

const router = express.Router();

router.post("/", verifyToken, generateFit);

export default router;
