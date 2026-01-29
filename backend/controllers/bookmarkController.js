import { pool } from "../db/connection.js";

export const addBookmark = async (req, res) => {
    try {
        const userId = req.user.id;
        const { recipe_id } = req.body; 

        const result = await pool.query(
            `INSERT INTO bookmarks (user_id, recipe_id) 
             VALUES ($1, $2) 
             ON CONFLICT (user_id, recipe_id) DO NOTHING 
             RETURNING id`,
            [userId, recipe_id]
        );

        if (result.rows.length === 0) {
            return res.status(200).json({ success: true, message: "이미 북마크된 레시피입니다." });
        }

        res.status(201).json({ 
            success: true, 
            bookmark_id: result.rows[0].id 
        });
    } catch (error) {
        console.error("북마크 추가 실패:", error);
        res.status(500).json({ message: "북마크 저장 실패" });
    }
};

export const getMyBookmarks = async (req, res) => {
    try {
        const userId = req.user.id;
        const { keyword } = req.query;
        
        const query = `
            SELECT 
                b.id AS bookmark_id, 
                b.created_at,
                r.id AS recipe_id, 
                r.title, 
                r.ingredients_key,
                r.content, 
                r.view_count 
            FROM bookmarks b
            JOIN recipes r ON b.recipe_id = r.id
            WHERE b.user_id = $1
            ORDER BY b.created_at DESC
        `;
        const queryParams = [userId];

        if (keyword) {
            // $2 파라미터로 검색어 추가
            // 제목(title) 또는 재료(ingredients_key - JSONB/Text)에 키워드가 포함되는지 확인
            query += ` AND (r.title LIKE $2 OR r.ingredients_key::text LIKE $2) `;
            queryParams.push(`%${keyword}%`);
        }

        query += ` ORDER BY b.created_at DESC`;

        const result = await pool.query(query, queryParams);

        const bookmarks = result.rows.map(row => ({
            ...row,
            content: typeof row.content === 'string' ? JSON.parse(row.content) : row.content,
            ingredients: typeof row.ingredients_key === 'string' ? JSON.parse(row.ingredients_key) : row.ingredients_key
        }));

        res.json(bookmarks);
    } catch (error) {
        console.error("북마크 목록 조회 실패:", error);
        res.status(500).json({ message: "북마크 목록 로드 실패" });
    }
};

export const removeBookmark = async (req, res) => {
    try {
        const userId = req.user.id;
        const { recipeId } = req.params; 

        const result = await pool.query(
            "DELETE FROM bookmarks WHERE user_id = $1 AND recipe_id = $2",
            [userId, recipeId]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ success: false, message: "북마크 목록에 없습니다." });
        }

        res.json({ success: true, message: "북마크가 취소되었습니다." });
    } catch (error) {
        console.error("북마크 삭제 실패:", error);
        res.status(500).json({ message: "북마크 취소 실패" });
    }
};