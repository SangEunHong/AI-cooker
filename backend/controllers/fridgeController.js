import { pool } from '../db/connection.js';

export const getIngredients = async (req, res) => {
    try {
        const userId = req.user.id; 

        const result = await pool.query(
            'SELECT * FROM ingredients WHERE user_id = $1 ORDER BY expiry_date ASC', 
            [userId]
        );

        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "서버 에러" });
    }
};

export const addIngredient = async (req, res) => {
    try {
        const userId = req.user.id;
        const { name, category, quantity, expiry_date } = req.body;

        const result = await pool.query(
            `INSERT INTO ingredients (user_id, name, category, quantity, expiry_date)
             VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
            [userId, name, category, quantity, unit, expiry_date]
        );

        res.status(201).json({ 
            success: true, 
            id: result.rows[0].id 
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "재료 추가 실패" });
    }
};

export const updateIngredient = async (req, res) => {
    try {
        const userId = req.user.id;
        const ingredientId = req.params.id;
        const { name, category, quantity, expiry_date } = req.body;

        const result = await pool.query(
            `UPDATE ingredients 
             SET name = $1, category = $2, quantity = $3, expiry_date = $4 
             WHERE id = $5 AND user_id = $6`,
            [quantity, expiry_date, ingredientId, userId]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ message: "재료를 찾을 수 없거나 권한이 없습니다." });
        }

        res.json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "재료 수정 실패" });
    }
};

export const deleteIngredient = async (req, res) => {
    try {
        const userId = req.user.id;
        const ingredientId = req.params.id;

        const result = await pool.query(
            'DELETE FROM ingredients WHERE id = $1 AND user_id = $2',
            [ingredientId, userId]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ message: "삭제할 재료가 없습니다." });
        }

        res.json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "재료 삭제 실패" });
    }
};