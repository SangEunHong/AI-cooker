import express from 'express';
import { signup, login, getMe, updateMe, withdraw } from '../controllers/authController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.get("/my", verifyToken, getMe);           
router.put("/my", verifyToken, updateMe);        
router.delete("/withdraw", verifyToken, withdraw); 

export default router;