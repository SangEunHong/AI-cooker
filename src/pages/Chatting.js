import { useState, useEffect, useRef } from 'react';
import apiClient from '../utils/api';
import '../style/Chatting.css';
import { useNavigate } from "react-router-dom";

function Chatting() {
  const [messages, setMessages] = useState([{ role: 'assistant', content: "어떤 요리를 도와드릴까요?" }]);
  const [inputValue, setInputValue] = useState('');
  const [fridgeItems, setFridgeItems] = useState([]);
  const [isFridgeOpen, setIsFridgeOpen] = useState(false);
  const [selectedNames, setSelectedNames] = useState([]);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null); 
  const [currentStepIdx, setCurrentStepIdx] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0); 
  const [isTimerActive, setIsTimerActive] = useState(false); 
  const [bookmarkedIds, setBookmarkedIds] = useState(new Set());

  useEffect(() => {
    let timer;
    if (isTimerActive && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isTimerActive) {
      setIsTimerActive(false);
      alert("⏰ 시간이 다 되었습니다!"); 
    }
    return () => clearInterval(timer);
  }, [isTimerActive, timeLeft]);

  const startTimer = (seconds) => {
    setTimeLeft(seconds);
    setIsTimerActive(true);
  };

  useEffect(() => {
    const fetchBookmarks = async () => {
      try {
        const res = await apiClient.get("/bookmarks");
        // API 명세: [ { "recipe": { "id": 10, ... } }, ... ]
        // item.recipe.id가 숫자인지 확인하고 Set에 담습니다.
        const ids = new Set(res.data.map(item => Number(item.recipe.id)));
        setBookmarkedIds(ids);
      } catch (err) {
        console.error("북마크 로드 실패:", err);
      }
    };
    fetchBookmarks();
  }, []);

  const closeStepCard = () => {
    setCurrentStepIdx(null);
    setIsTimerActive(false);
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const loadFridge = async () => {
      try {
        const response = await apiClient.get("/ingredients");
        setFridgeItems(response.data);
      } catch (err) { console.error(err); }
    };
    loadFridge();
  }, []);

  const toggleBookmark = async (e, recipeId) => {
    e.stopPropagation(); // 카드 클릭 이벤트 전파 방지
    
    const id = Number(recipeId); // 타입을 숫자로 통일
    const isBookmarked = bookmarkedIds.has(id);

    try {
      if (isBookmarked) {
        // [DELETE] /bookmarks/:recipeId
        await apiClient.delete(`/bookmarks/${id}`);
        
        // 상태 업데이트: Set에서 해당 ID 삭제
        setBookmarkedIds(prev => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      } else {
        // [POST] /bookmarks { "recipe_id": 10 }
        const res = await apiClient.post("/bookmarks", { recipe_id: id });
        
        if (res.data.success) {
          // 상태 업데이트: Set에 ID 추가
          setBookmarkedIds(prev => new Set(prev).add(id));
        }
      }
    } catch (err) {
      console.error("북마크 작업 실패:", err);
      alert("북마크 처리에 실패했습니다.");
    }
  };

const handleRecipeClick = async (id) => {
  try {
    const response = await apiClient.get(`/recipes/${id}`);
    
    let recipeData = typeof response.data.content === 'string' 
      ? JSON.parse(response.data.content) 
      : response.data.content;

    recipeData.actual_id = id; 

    setSelectedRecipe(recipeData); 
    window.scrollTo(0, 0);
  } catch (err) {
    console.error("레시피 상세 로드 실패", err);
    alert("레시피를 불러오는데 실패했습니다.");
  }
};
  
const addIngredientToInput = (item) => {
  const unit = item.category === 'meat' ? 'g' : item.category === 'vege' ? '개' : '';
  const ingredientText = `(${item.name} ${item.quantity}${unit})`;
  
  setInputValue(prev => prev ? `${prev}, ${ingredientText}` : ingredientText);
  
  setSelectedNames(prev => [...prev, item.name]);
};

const handleBackToChat = () => {
    setSelectedRecipe(null);
  };

const handleSend = async (e) => {
  e.preventDefault();
  if (!inputValue.trim()) return;

  setMessages(prev => [...prev, { role: 'user', content: inputValue }]);
  setLoading(true);
  try {
    let payload = {};
    
    if (selectedNames.length > 0) {
      payload = {
        mode: "fridge",
        ingredients: selectedNames, 
        // cuisine: "한식" 
      };
    } else {
      payload = {
        mode: "chat",
        user_prompt: inputValue
      };
    }

    const response = await apiClient.post("/chat", payload);
    
    setMessages(prev => [...prev, { role: 'assistant', recipes: response.data }]);
    
  } catch (err) {
    let errorMsg = "GEMINI 연결에 실패했습니다.";
    setMessages(prev => [...prev, { role: 'assistant', content: "GEMINI 연결에 실패했습니다." }]);
  } finally{
    setLoading(false);
  }


  setInputValue('');
  setSelectedNames([]);
  setIsFridgeOpen(false); 
};


// 진짜 이게 맞나..
  return (
    <div className="chat-room-container">
      <div className="chat-window">
        {selectedRecipe ? (
          <div className="recipe-detail-view">

            <button className="back-btn" onClick={handleBackToChat}>← 다시 채팅하기</button>
            <button 
              className="detail-bookmark-btn" 
              onClick={(e) => toggleBookmark(e, selectedRecipe.actual_id)}
            >
              {bookmarkedIds.has(Number(selectedRecipe.actual_id)) 
                ? '🧡 저장됨' 
                : '🤍 레시피 저장'}
            </button>
            
            
            <button className="share-btn" onClick={() => {
              
              alert('레시피가 복사 되었습니다!');
            }}>🔗 공유하기</button>

            <h1 className="detail-title">🍳 {selectedRecipe.title}</h1>

            <p className="detail-desc">{selectedRecipe.description}</p>
            
            <div className="detail-meta">
              <span>⏰ {selectedRecipe.time_taken}</span>
              <span>⭐ {selectedRecipe.difficulty}</span>
              <span>👥 {selectedRecipe.serving || '1인분'}</span>
            </div>

            <div className="detail-section">
              <h3 className="section-title">📦 준비 재료</h3>
              <ul className="detail-ingredients">
                {selectedRecipe.ingredients?.map((ing, idx) => (
                  <li key={idx} className={ing.is_owned ? "owned" : "need"}>
                    {ing.name} <span className="amount">{ing.amount}</span>
                    {ing.is_owned && <span className="check-mark"> ✅</span>}
                  </li>
                ))}
              </ul>
            </div>

            <div className="detail-section">
              <h3 className="section-title">👨‍🍳 조리 순서 (클릭하여 요리모드 시작)</h3>
              <div className="detail-steps">
                {selectedRecipe.steps?.map((step, index) => (
                  <div 
                    key={step.step_no} 
                    className="step-item clickable" 
                    onClick={() => setCurrentStepIdx(index)} 
                  >
                    <div className="step-num">{step.step_no}</div>
                    <div className="step-content">
                      <p className="step-text">{step.instruction}</p>
                      {step.timer_sec > 0 && <span className="step-timer-badge">⏲️ {step.timer_sec}초</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg, idx) => (
              <div key={idx} className={`bubble-wrapper ${msg.role}`}>
                {msg.content && <div className="bubble">{msg.content}</div>}

                {msg.recipes && (
                  <div className="recipe-grid">
                    {msg.recipes.map(r => {
                      const isLiked = bookmarkedIds.has(Number(r.recipe_id));
                      
                      return (
                        <div key={r.recipe_id} className="recipe-card-container" style={{ position: 'relative' }}>
                          <button className="recipe-card" onClick={() => handleRecipeClick(r.recipe_id)}>
                            <div className="recipe-title">✨ {r.title}</div>
                            <div className="recipe-desc">{r.desc}</div>
                            <div className="recipe-meta">{r.time} · {r.difficulty}</div>
                          </button>
                          
                          <button 
                            className={`bookmark-btn ${isLiked ? 'active' : 'inactive'}`}
                            onClick={(e) => toggleBookmark(e, r.recipe_id)}
                          >
                            {isLiked ? '🧡' : '🤍'}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}


          {loading && (
            <div div className="bubble-wrapper assistant">
              <div className="bubble loading-bubble">
                <h3 className="loading-text">레시피 생성중...</h3>
              </div>
            </div>
          )}

          </>

          
        )}



        <div ref={chatEndRef} />


      </div>

      {!selectedRecipe && (
        <div className="bottom-controls">
          <button 
            className="fridge-full-btn"
            onClick={() => setIsFridgeOpen(!isFridgeOpen)}
          >
            {isFridgeOpen ? '🔽 냉장고 닫기' : '🧊 내 냉장고 재료 보기'}
          </button>

          <div className={`fridge-drawer ${isFridgeOpen ? 'open' : ''}`}>
            <div className="ingredient-grid">
              {fridgeItems.map(item => (
                <button 
                  key={item.id}
                  className="ingredient-item-btn"
                  onClick={() => addIngredientToInput(item)}
                >
                  <div className="left-group">
                    <span className="name">{item.name}  </span>
                    <span className="quantity">
                      {item.quantity}{item.category === 'meat' ? 'g' : item.category === 'vege' ? '개' : ''}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <form className="chat-input-row" onSubmit={handleSend}>
            <input 
              type="text" 
              placeholder="메시지를 입력하거나 냉장고에서 재료를 선택하세요" 
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />
            <button type="submit" className="send-button">보내기</button>
          </form>
        </div>
      )}

      {currentStepIdx !== null && (
        <div className="step-card-overlay">
          <div className="step-card">
            <div className="step-card-header">
              <span className="step-indicator">STEP {selectedRecipe.steps[currentStepIdx].step_no} / {selectedRecipe.steps.length}</span>
              <button className="close-x-btn" onClick={closeStepCard}>&times;</button>
            </div>
            
            <div className="step-card-body">
              <p className="step-instruction-large">
                {selectedRecipe.steps[currentStepIdx].instruction}
              </p>

              {selectedRecipe.steps[currentStepIdx].timer_sec > 0 && (
                <div className="timer-container">
                  <div className="timer-display">
                    {isTimerActive ? `⏳ ${timeLeft}` : `⏲️ 시간: ${selectedRecipe.steps[currentStepIdx].timer_sec}초`}
                  </div>
                  {!isTimerActive ? (
                    <button className="timer-btn start" onClick={() => startTimer(selectedRecipe.steps[currentStepIdx].timer_sec)}>타이머 시작</button>
                  ) : (
                    <button className="timer-btn stop" onClick={() => setIsTimerActive(false)}>일시정지</button>
                  )}
                </div>
              )}
            </div>

            <div className="step-card-footer">
              <button 
                disabled={currentStepIdx === 0} 
                onClick={() => { setCurrentStepIdx(currentStepIdx - 1); setIsTimerActive(false); }}
              >이전</button>
              
              {currentStepIdx < selectedRecipe.steps.length - 1 ? (
                <button className="next-btn" onClick={() => { setCurrentStepIdx(currentStepIdx + 1); setIsTimerActive(false); }}>다음</button>
              ) : (
                <button className="finish-btn" onClick={closeStepCard}>요리 완료!</button>
              )}
            </div>
          </div>
        </div>
      )}


    </div>
  );
}
export default Chatting;