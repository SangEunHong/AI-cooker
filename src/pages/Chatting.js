import { useState, useEffect, useRef } from 'react';
import apiClient from '../utils/api';
import '../style/Chatting.css';

function Chatting() {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [fridgeItems, setFridgeItems] = useState([]);
  const [selectedIngredients, setSelectedIngredients] = useState([]);
  const [isFridgeOpen, setIsFridgeOpen] = useState(false);
  const chatEndRef = useRef(null);

  // 자동 스크롤
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 재료 미리 로드
  useEffect(() => {
    const loadFridge = async () => {
      try {
        const response = await apiClient.get("/ingredients");
        setFridgeItems(response.data);
      } catch (err) { console.error(err); }
    };
    loadFridge();
  }, []);

  const handleSend = async (e) => {
    e.preventDefault();
    
    // Mode 결정 (냉장고 열려있으면 fridge, 닫혀있으면 chat)
    const currentMode = isFridgeOpen ? "fridge" : "chat";
    const userMsg = currentMode === "fridge" 
      ? `🥦 선택한 재료로 추천해줘: ${selectedIngredients.join(', ')}`
      : inputValue;

    if (!userMsg.trim() && selectedIngredients.length === 0) return;

    // 유저 메시지 추가
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);

    try {
      const payload = currentMode === "fridge"
        ? { mode: "fridge", ingredients: selectedIngredients, cuisine: "한식" }
        : { mode: "chat", user_prompt: inputValue };

      const response = await apiClient.post("/chat", payload);
      setMessages(prev => [...prev, { role: 'assistant', recipes: response.data }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: "죄송해요, 답변을 가져오지 못했어요." }]);
    }

    setInputValue('');
    setSelectedIngredients([]);
    setIsFridgeOpen(false); // 전송 후 목록 닫기
  };

  return (
    <div className="chat-room-container">
      {/* 1. 채팅 내역창 */}
      <div className="chat-window">
        {messages.map((msg, idx) => (
          <div key={idx} className={`bubble-wrapper ${msg.role}`}>
            <div className="bubble">
              {msg.content}
              {msg.recipes && (
                <div className="recipe-grid">
                  {msg.recipes.map(r => (
                    <div key={r.recipe_id} className="recipe-card">
                      <div className="recipe-title">✨ {r.title}</div>
                      <div className="recipe-desc">{r.desc}</div>
                      <div className="recipe-meta">{r.time} · {r.difficulty}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      {/* 2. 하단 컨트롤 영역 (냉장고 버튼 + 서랍 + 입력창) */}
      <div className="bottom-controls">
        
        {/* 가로로 꽉 차는 냉장고 토글 버튼 */}
        <button 
          className={`fridge-full-btn ${isFridgeOpen ? 'active' : ''}`}
          onClick={() => setIsFridgeOpen(!isFridgeOpen)}
        >
          {isFridgeOpen ? '🔽 냉장고 닫기' : '🧊 내 냉장고 재료 보기'}
        </button>

        {/* 냉장고 재료 서랍 (버튼 위에 나타남) */}
        <div className={`fridge-drawer ${isFridgeOpen ? 'open' : ''}`}>
          <div className="ingredient-grid">
            {fridgeItems.map(item => (
              <button 
                key={item.id}
                className={`ingredient-chip ${selectedIngredients.includes(item.name) ? 'selected' : ''}`}
                onClick={() => setSelectedIngredients(prev => 
                  prev.includes(item.name) ? prev.filter(i => i !== item.name) : [...prev, item.name]
                )}
              >
                {item.name}
              </button>
            ))}
          </div>
        </div>

        {/* 채팅 입력창 */}
        <form className="chat-input-row" onSubmit={handleSend}>
          <input 
            type="text" 
            placeholder={isFridgeOpen ? "재료를 선택한 후 전송을 누르세요" : "메시지를 입력하세요..."}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={isFridgeOpen} // 냉장고 모드일 땐 텍스트 입력 방지
          />
          <button type="submit" className="send-button">전송</button>
        </form>
      </div>
    </div>
  );
}

export default Chatting;