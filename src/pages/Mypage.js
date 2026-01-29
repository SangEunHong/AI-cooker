import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import '../style/Fridge.css';
import '../style/Chatting.css'; 

function Mypage() {
  const { logout } = useAuth();
  const { addNotification } = useNotification();
  const navigate = useNavigate();

  const [userInfo, setUserInfo] = useState({ email: '', nickname: '' });
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);

  // 수정 및 탈퇴용 상태
  const [editData, setEditData] = useState({ nickname: '', password: '' });
  const [withdrawPassword, setWithdrawPassword] = useState('');

  // --- 레시피 상세 보기 및 요리 모드 상태 ---
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [currentStepIdx, setCurrentStepIdx] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isTimerActive, setIsTimerActive] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, []);

  // 타이머 로직
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

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [userRes, bookmarkRes] = await Promise.all([
        apiClient.get('/auth/my'),
        apiClient.get('/bookmarks')
      ]);
      setUserInfo(userRes.data);
      setBookmarks(bookmarkRes.data);
      setEditData({ nickname: userRes.data.nickname, password: '' });
    } catch (err) {
      addNotification('정보를 불러오는데 실패했습니다.', 'error');
    } finally {
      setLoading(false);
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
    } catch (err) {
      addNotification('레시피를 불러오는데 실패했습니다.', 'error');
    }
  };

  const startTimer = (seconds) => {
    setTimeLeft(seconds);
    setIsTimerActive(true);
  };

  const closeStepCard = () => {
    setCurrentStepIdx(null);
    setIsTimerActive(false);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editData.nickname.trim()) return alert("닉네임을 입력해주세요.");
    try {
      const res = await apiClient.put('/auth/my', editData);
      if (res.data.success) {
        addNotification('정보가 수정되었습니다.', 'success');
        setUserInfo(prev => ({ ...prev, nickname: editData.nickname }));
      }
    } catch (err) {
      addNotification('수정에 실패했습니다.', 'error');
    }
  };

  const handleDeleteBookmark = async (e, recipeId) => {
    e.stopPropagation();
    if (!window.confirm("북마크를 취소하시겠습니까?")) return;
    try {
      const res = await apiClient.delete(`/bookmarks/${recipeId}`);
      if (res.data.success) {
        setBookmarks(prev => prev.filter(item => item.recipe.id !== recipeId));
        addNotification('북마크가 취소되었습니다.', 'success');
      }
    } catch (err) {
      addNotification('북마크 취소 실패', 'error');
    }
  };

  const handleWithdraw = async () => {
    if (!withdrawPassword) return alert('비밀번호를 입력해주세요.');
    if (!window.confirm('정말로 탈퇴하시겠습니까?')) return;
    try {
      const res = await apiClient.delete('/auth/withdraw', { data: { password: withdrawPassword } });
      if (res.data.success) {
        addNotification('탈퇴 완료되었습니다.', 'success');
        logout();
        navigate('/');
      }
    } catch (err) {
      addNotification('비밀번호가 틀렸거나 오류가 발생했습니다.', 'error');
    }
  };

  if (loading) return <div className="LoadingList">정보 로딩 중...</div>;

  return (
    <div className="fridgeList">
      <main className="AddListB">
        <h1>마이페이지</h1>

        <section className="added-item">
          <label>이메일</label>
          <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{userInfo.email}</div>
        </section>

        <hr />

        <section>
          <h2 style={{ textAlign: 'left', fontSize: '28px' }}>내 정보 수정</h2>
          <form onSubmit={handleUpdate}>
            <div className="added-item">
              <label>닉네임</label>
              <input
                type="text"
                value={editData.nickname}
                onChange={(e) => setEditData({ ...editData, nickname: e.target.value })}
                required
              />
            </div>
            <div className="added-item">
              <label>비밀번호</label>
              <input
                type="password"
                placeholder="새 비밀번호 (미입력 시 유지)"
                value={editData.password}
                onChange={(e) => setEditData({ ...editData, password: e.target.value })}
              />
            </div>
            <button type="submit" className="btn-submit2">수정 내용 저장</button>
          </form>
        </section>

        <hr />

        <section>
          <h2 style={{ textAlign: 'left', fontSize: '28px' }}>북마크 레시피 ({bookmarks.length})</h2>
          {bookmarks.length === 0 ? (
            <p className="empty-msg">저장된 레시피가 없습니다.</p>
          ) : (
            <ul className="ingredient-list">
              {bookmarks.map((item) => (
                <li key={item.bookmark_id} className="ingredient-item">
                  <div className="info">
                    <span className="name" onClick={() => handleRecipeClick(item.recipe.id)} style={{ cursor: 'pointer' }}>
                      🍳 {item.recipe?.title}
                    </span>
                    <button className="btn-delete" style={{ padding: '10px 20px', fontSize: '16px' }} onClick={(e) => handleDeleteBookmark(e, item.recipe.id)}>
                      삭제
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <hr />

        <div className="button-container" style={{ flexDirection: 'column', gap: '40px' }}>
          <button className="btn-submit" style={{ width: '100%' }} onClick={() => { logout(); navigate('/login'); }}>
            로그아웃
          </button>
          <div style={{ background: '#f9f9f9', padding: '30px', borderRadius: '20px' }}>
            <h3 style={{ marginTop: 0, color: '#c0392b' }}>회원 탈퇴</h3>
            <div className="added-item">
              <input type="password" placeholder="비밀번호를 입력하세요" value={withdrawPassword} onChange={(e) => setWithdrawPassword(e.target.value)} />
            </div>
            <button className="btn-delete" style={{ width: '100%' }} onClick={handleWithdraw}>영구 탈퇴하기</button>
          </div>
        </div>
      </main>

      {/* --- 레시피 상세 모달 (작은 창 버전) --- */}
      {selectedRecipe && (
        <div className="recipe-modal-overlay" 
             style={{
               position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', 
               backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, 
               display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px'
             }}
             onClick={() => setSelectedRecipe(null)} // 바깥 클릭 시 닫기
        >
          <div className="recipe-modal-content" 
               style={{
                 backgroundColor: 'white', width: '100%', maxWidth: '600px', maxHeight: '85vh',
                 borderRadius: '30px', overflowY: 'auto', padding: '30px', position: 'relative',
                 boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
               }}
               onClick={(e) => e.stopPropagation()} // 내부 클릭 시 닫힘 방지
          >
            <button className="back-btn" onClick={() => setSelectedRecipe(null)} style={{ position: 'sticky', top: 0, marginBottom: '10px' }}>
              &times; 닫기
            </button>
            
            <div className="recipe-detail-view" style={{ padding: 0 }}>
              <h1 className="detail-title" style={{ fontSize: '28px' }}>🍳 {selectedRecipe.title}</h1>
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
                    <li key={idx}> {ing.name} <span className="amount">{ing.amount}</span></li>
                  ))}
                </ul>
              </div>

              <div className="detail-section">
                <h3 className="section-title">👨‍🍳 조리 순서</h3>
                <div className="detail-steps">
                  {selectedRecipe.steps?.map((step, index) => (
                    <div key={step.step_no} className="step-item clickable" onClick={() => setCurrentStepIdx(index)}>
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
          </div>
        </div>
      )}

      {/* --- 요리 단계 카드 --- */}
      {currentStepIdx !== null && (
        <div className="step-card-overlay" style={{ zIndex: 1100 }}>
          <div className="step-card">
            <div className="step-card-header">
              <span className="step-indicator">STEP {selectedRecipe.steps[currentStepIdx].step_no} / {selectedRecipe.steps.length}</span>
              <button className="close-x-btn" onClick={closeStepCard}>&times;</button>
            </div>
            <div className="step-card-body">
              <p className="step-instruction-large">{selectedRecipe.steps[currentStepIdx].instruction}</p>
              {selectedRecipe.steps[currentStepIdx].timer_sec > 0 && (
                <div className="timer-container">
                  <div className="timer-display">{isTimerActive ? `⏳ ${timeLeft}` : `⏲️ 시간: ${selectedRecipe.steps[currentStepIdx].timer_sec}초`}</div>
                  {!isTimerActive ? (
                    <button className="timer-btn start" onClick={() => startTimer(selectedRecipe.steps[currentStepIdx].timer_sec)}>타이머 시작</button>
                  ) : (
                    <button className="timer-btn stop" onClick={() => setIsTimerActive(false)}>일시정지</button>
                  )}
                </div>
              )}
            </div>
            <div className="step-card-footer">
              <button disabled={currentStepIdx === 0} onClick={() => { setCurrentStepIdx(currentStepIdx - 1); setIsTimerActive(false); }}>이전</button>
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

export default Mypage;