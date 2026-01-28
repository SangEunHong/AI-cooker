import express from "express";
import { chat } from "../controllers/chatController.js";
import { getRecipeDetail } from "../controllers/recipeController.js"; 

const router = express.Router();


router.post("/", chat);
export default router;