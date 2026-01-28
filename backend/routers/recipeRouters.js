import express from "express";
import { getRecipeDetail } from "../controllers/recipeController.js";

const router = express.Router();

router.get("/:id", getRecipeDetail); 

export default router;