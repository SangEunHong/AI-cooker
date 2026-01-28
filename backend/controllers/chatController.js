import { GoogleGenerativeAI } from "@google/generative-ai";
import { pool } from "../db/connection.js";
import dotenv from "dotenv";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

export const chat = async (req, res) => {
  try {
    const { mode, ingredients = [], cuisine, user_prompt } = req.body;

    let promptInput = "";
    if (mode === "fridge") {
      promptInput = `
        나는 지금 냉장고에 [${ingredients.join(", ")}] 재료를 가지고 있어.
        [필수 규칙]:
        1. 메인 식재료는 반드시 내가 가진 위 재료들 중에서만 사용해. (없는 고기, 해산물, 야채 추가 금지)
        2. 단, 기본 양념(물, 소금, 설탕, 후추, 식용유, 간장)은 집에 있다고 가정하고 레시피에 자유롭게 사용해줘.
        3. 이 재료들로 만들 수 있는 ${cuisine || "맛있는"} 요리 레시피 3가지를 추천해줘.
      `;
        if (user_prompt) {
            promptInput += `
            \n[추가 요구사항]: 사용자가 "${user_prompt}" 스타일의 요리를 원하고 있어. 위 규칙을 지키면서 이 요구사항도 반영해줘.
            `;
        } else {
            promptInput += `\n특별한 요구사항이 없으니 ${cuisine || "맛있는"} 스타일로 추천해줘.`;
        }
    } else {
      promptInput = `
        다음 사용자의 요청에 어울리는 요리 레시피 3가지를 추천해줘:
        "${user_prompt}"
      `;
    }

    const systemInstruction = `
      너는 전문 요리사야. 위 요청에 맞춰 레시피 3가지를 추천해줘.

      [중요 규칙 - 재료 분석]:
      1. 사용자가 현재 보유한 재료 목록: [${ingredients.join(", ")}]
      2. 레시피에 필요한 각 재료에 대해, 사용자가 보유하고 있으면 "is_owned": true, 없으면 false로 표시해줘.
      3. 단, '기본 양념'(물, 소금, 설탕, 후추, 식용유, 간장)은 사용자가 언급하지 않았어도 집에 있다고 가정하고 "is_owned": true로 설정해줘.
      반드시 아래의 JSON 포맷(Array)으로만 답변해줘. 마크다운(\`\`\`json)이나 사족은 붙이지 말아줘.
      
      [중요 규칙 - 계량 표기 표준화]:
      1. 양념류(액체, 가루)의 'amount'는 사용자가 헷갈리지 않게 반드시 '단위(ml 기준)' 형식을 지켜줘.
         - 예시: "1큰술" -> "1큰술(15ml)"
         - 예시: "1작은술" -> "1작은술(5ml)"
         - 예시: "1컵" -> "1컵(200ml)"
      2. 밥숟가락 계량이 더 편한 재료는 "1큰술(밥숟가락 2개)" 처럼 현실적인 가이드를 덧붙여도 좋아.
      
      [형식 예시]
      [
        {
          "title": "요리 이름",
          "description": "요리에 대한 간단한 한 줄 설명",
          "ingredients": [
            { "name": "고춧가루", "amount": "1큰술(15ml)", "is_owned": true },
            { "name": "진간장", "amount": "2큰술(30ml)", "is_owned": true },
            { "name": "다진마늘", "amount": "1/2큰술(약 7ml)", "is_owned": true }
          ],
          "difficulty": "하",
          "time_taken": "15분",
          "steps": [
            { "step_no": 1, "instruction": "물을 끓이세요.", "timer_sec": 0 },
            { "step_no": 2, "instruction": "면을 넣고 3분간 삶으세요.", "timer_sec": 180 }
          ]
        }
      ]
      
      * 주의사항:
      1. steps의 "timer_sec"는 타이머가 필요 없으면 0, 필요하면 '초 단위(숫자)'로 적어줘.
      2. 한국어로 답변해줘.
    `;
    const result = await model.generateContent(`${promptInput}\n${systemInstruction}`);
    const response = await result.response;
    let text = response.text();
    text = text.replace(/```json/g, "").replace(/```/g, "").trim();
    const recipes = JSON.parse(text);

    const summaryList = [];

    for (const recipe of recipes) {
      const insertQuery = `
        INSERT INTO recipes (title, ingredients_key, content)
        VALUES ($1, $2, $3)
        RETURNING id
      `;
      
      const dbResult = await pool.query(insertQuery, [
        recipe.title,
        JSON.stringify(recipe.ingredients), 
        JSON.stringify(recipe)              
      ]);

      summaryList.push({
        recipe_id: dbResult.rows[0].id,
        title: recipe.title,
        desc: recipe.description,
        time: recipe.time_taken,
        difficulty: recipe.difficulty
      });
    }

    res.status(200).json(summaryList);

  } catch (error) {
    console.error("AI Chat Error:", error);
    res.status(500).json({ message: "레시피 생성 중 오류가 발생했습니다." });
  }
};