import express from 'express';
import { verifyToken } from '../middleware/authMiddleware.js';
import { 
    getIngredients, 
    addIngredient, 
    updateIngredient, 
    deleteIngredient 
} from '../controllers/fridgeController.js';

const router = express.Router();

router.use(verifyToken); 

router.get('/', getIngredients);          
router.post('/', addIngredient);          
router.put('/:id', updateIngredient);     
router.delete('/:id', deleteIngredient);  

export default router;