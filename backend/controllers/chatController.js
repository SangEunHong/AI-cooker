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
        [필수 규칙 - 엄격 모드]:
        1. 메인 식재료는 오직 내가 가진 위 재료 목록에서만 골라야 해. (없는 고기, 해산물, 야채 절대 추가 금지)
        2. 재료 옆에 적힌 수량(괄호 안 숫자)을 반드시 확인해. - 내가 가진 양보다 더 많은 재료가 필요한 레시피는 추천하지 마.
           - 예시: 내가 "계란(1개)"를 가지고 있다면, 계란 2개 이상 들어가는 요리는 제외해.
        3. 기본 양념 사용 규칙:
           - [물, 소금, 설탕, 후추, 식용유, 간장,]는 집에 있다고 가정하고 써도 돼.
           - (주의: 고추장, 된장은 냉장고 재료 목록에 없으면 쓰지 마.)

        4. 향신채소 엄격 제한:
           - '다진 마늘', '대파', '양파', '청양고추'는 기본 양념이 아니야!
           - 위 냉장고 재료 목록에 명시되어 있지 않다면 절대 레시피에 넣지 마. 
           - "없으면 생략 가능"이라고 적지 말고, 아예 그 재료가 들어가지 않는 레시피를 추천해.
        5. 이 조건 안에서 만들 수 있는 ${cuisine || "맛있는"} 요리 레시피 3가지를 추천해줘.
      `;
        if (user_prompt) {
            promptInput += `
            \n[추가 요구사항]: 사용자가 "${user_prompt}" 스타일의 요리를 원하고 있어. 위 규칙을 지키면서 이 요구사항도 반영해.
            `;
        } else {
            promptInput += `\n특별한 요구사항이 없으니 ${cuisine || "맛있는"} 스타일로 추천해.`;
        }
    } else {
      promptInput = `
        다음 사용자의 요청에 어울리는 요리 레시피 3가지를 추천해줘:
        "${user_prompt}"
      `;
    }

    const systemInstruction = `
      너는 전문 요리사야. 위 요청에 맞춰 레시피 3가지를 추천해줘.

      [중요 규칙 - 기본 설정]:
      1. 별도의 요청이 없다면 모든 레시피는 '1인분'을 기준으로 작성해줘.
      2. 만약 재료 양이 넉넉하다면 2인분 이상도 제안 가능하지만, 기본은 1인분이야.
      [중요 규칙 - is_owned 판별]:
      1. 레시피 재료 목록의 "is_owned" 값을 결정할 때, 아래의 [보유 인정 기준]에 포함되는지 엄격하게 확인해줘.
      
      2. [보유 인정 기준]:
         - 조건 A: 사용자가 입력한 재료 목록: [${ingredients.join(", ")}] 에 포함된 경우.
         - 조건 B: 다음의 [기본 양념 리스트]에 정확히 일치하는 경우.
           -> [기본 양념 리스트]: 물, 소금, 설탕, 후추, 식용유, 간장
      
      3. [보유 불가 판정]:
         - 위 조건 A, B 어디에도 속하지 않는 재료는 무조건 "is_owned": false 로 설정해줘.
         - 주의: '고춧가루', '다진마늘', '대파', '양파', '청양고추', '된장', '고추장'은 사용자가 가지고 있다고 명시하지 않았다면 절대 기본 양념으로 치지 마. (무조건 false)
      [중요 규칙 - 재료 및 수량 분석]:
      1. 사용자가 현재 보유한 재료 목록: [${ingredients.join(", ")}]
      2. 보유한 재료의 양을 엄격하게 지켜줘.
         - 레시피 생성 시, 사용자가 가진 양(괄호 안)을 초과하는 재료량을 요구하지 마.
         - 만약 재료가 부족해서 만들 수 있는 요리가 제한적이라면, 아주 간단한 조리법(예: 계란후라이, 구이 등)이라도 추천해.

      [중요 규칙 - 계량 표기 표준화]:
      1. 양념류(액체, 가루)의 'amount'는 사용자가 헷갈리지 않게 반드시 '단위(ml 기준)' 형식을 지켜줘.
         - 예시: "1큰술(15ml)", "1작은술(5ml)", "1컵(200ml)"
      2. 밥숟가락 계량이 더 편한 재료는 "1큰술(밥숟가락 2개)" 처럼 현실적인 가이드를 덧붙여도 좋아.
      
      반드시 아래의 JSON 포맷(Array)으로만 답변해줘. 마크다운(\`\`\`json)이나 사족은 붙이지 말아줘.

      [형식 예시]
      [
        {
          "title": "파송송 계란국",
          "description": "시원한 국물 요리",
          "serving": "1인분",
          "ingredients": [
            { "name": "계란", "amount": "2개", "is_owned": true },
            { "name": "물", "amount": "500ml", "is_owned": true },
            { "name": "대파", "amount": "1/2대", "is_owned": false }, 
            { "name": "다진마늘", "amount": "1/2큰술(약 7ml)", "is_owned": false },
            { "name": "소금", "amount": "1작은술", "is_owned": true }
          ],
          "difficulty": "하",
          "time_taken": "10분",
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
        serving: recipe.serving,
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