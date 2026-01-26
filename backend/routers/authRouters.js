import express from 'express';
import { signup, login, findMyInfo } from '../controllers/authController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.get('/my', verifyToken, findMyInfo);

export default router;