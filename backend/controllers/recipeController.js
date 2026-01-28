import { pool } from "../db/connection.js";

export const getRecipeDetail = async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query("UPDATE recipes SET view_count = view_count + 1 WHERE id = $1", [id]);
    
    const result = await pool.query("SELECT * FROM recipes WHERE id = $1", [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "레시피를 찾을 수 없습니다." });
    }

    const recipe = result.rows[0];

    res.status(200).json({
      id: recipe.id,
      title: recipe.title,
      content: recipe.content, 
      view_count: recipe.view_count
    });

  } catch (error) {
    console.error("Recipe Detail Error:", error);
    res.status(500).json({ message: "서버 오류" });
  }
};