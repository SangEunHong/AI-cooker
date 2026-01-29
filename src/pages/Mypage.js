import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import '../style/Fridge.css';

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

  useEffect(() => {
    fetchInitialData();
  }, []);

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
      console.error("데이터 로드 실패:", err);
      addNotification('정보를 불러오는데 실패했습니다.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // 1. 정보 수정 (PUT /auth/my)
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

  // 2. 북마크 삭제 (DELETE /bookmarks/:recipeId)
  const handleDeleteBookmark = async (e, recipeId) => {
    e.stopPropagation(); // 리스트 클릭 이벤트 방지
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

  // 3. 회원 탈퇴 (DELETE /auth/withdraw)
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

        {/* 내 기본 정보 */}
        <section className="added-item">
          <label>이메일</label>
          <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{userInfo.email}</div>
        </section>

        <hr />

        {/* 정보 수정 */}
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

        {/* 북마크 리스트 (API 명세 반영) */}
        <section>
          <h2 style={{ textAlign: 'left', fontSize: '28px' }}>북마크 레시피 ({bookmarks.length})</h2>
          {bookmarks.length === 0 ? (
            <p className="empty-msg">저장된 레시피가 없습니다.</p>
          ) : (
            <ul className="ingredient-list">
              {bookmarks.map((item) => (
                <li key={item.bookmark_id} className="ingredient-item">
                  <div className="info">
                    <span className="name" onClick={() => navigate('/chatting')} style={{ cursor: 'pointer' }}>
                      🍳 {item.recipe?.title}
                    </span>
                    <button 
                      className="btn-delete" 
                      style={{ padding: '10px 20px', fontSize: '16px' }}
                      onClick={(e) => handleDeleteBookmark(e, item.recipe.id)}
                    >
                      삭제
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <hr />

        {/* 로그아웃 및 탈퇴 */}
        <div className="button-container" style={{ flexDirection: 'column', gap: '40px' }}>
          <button className="btn-submit" style={{ width: '100%' }} onClick={() => { logout(); navigate('/login'); }}>
            로그아웃
          </button>
          
          <div style={{ background: '#f9f9f9', padding: '30px', borderRadius: '20px' }}>
            <h3 style={{ marginTop: 0, color: '#c0392b' }}>회원 탈퇴</h3>
            <div className="added-item">
              <input
                type="password"
                placeholder="비밀번호를 입력하세요"
                value={withdrawPassword}
                onChange={(e) => setWithdrawPassword(e.target.value)}
              />
            </div>
            <button className="btn-delete" style={{ width: '100%' }} onClick={handleWithdraw}>
              영구 탈퇴하기
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Mypage;