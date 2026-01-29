import express from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import { 
    addBookmark, 
    getMyBookmarks, 
    removeBookmark 
} from "../controllers/bookmarkController.js";

const router = express.Router();

router.post("/", verifyToken, addBookmark);       
router.get("/", verifyToken, getMyBookmarks);        
router.delete("/:recipeId", verifyToken, removeBookmark);

export default router;