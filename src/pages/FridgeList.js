import { useState, useEffect } from 'react';
import apiClient from '../utils/api';
import '../style/Fridge.css';

function FridgeList() {
  const [ingredients, setIngredients] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState([]);

  useEffect(() => {
    // 배경색은 CSS의 var(--bg-color)가 처리하므로 깔끔하게 유지됩니다.
    const fetchIngredients = async () => {
      try {
        const response = await apiClient.get("/ingredients");
        setIngredients(response.data);
      } catch (error) {
        console.error("실패:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchIngredients();
  }, []);

  const filterIngredients = ingredients.filter(item =>
    category.length === 0 ? true : category.includes(item.category)
  );

  const toggleCategory = (cat) => {
    setCategory(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  if (loading) return <div className="LoadingList">냉장고 확인 중...</div>;

  return (
    /* 수정 1: 컨테이너 클래스를 fridgeList로 확실히 고정 */
    <div className="fridgeList"> 
      {/* 수정 2: 메인 카드 클래스를 AddListB로 사용 (CSS의 max-width: 850px 적용 지점) */}
      <main className="AddListB"> 
        <h1>나의 냉장고</h1>

        <div className="AddListS">
          {['meat', 'vege', 'sauce'].map(cat => (
            <label key={cat} className="category-choice">
              <input 
                type="checkbox" 
                checked={category.includes(cat)}
                onChange={() => toggleCategory(cat)}
              /> {cat === 'meat' ? '육류' : cat === 'vege' ? '채소' : '소스'}
            </label>
          ))}
        </div>

        <hr />

        <div className="ingredientListS">
          {filterIngredients.length === 0 ? (
            <p className="empty-msg">재료가 없어요.</p>
          ) : (
            <ul className="ingredient-list">
              {filterIngredients.map(item => (
                <li key={item.id} className="ingredient-item">
                  <div className="info">
                    <span className="name">{item.name}</span>
                    <span className="quantity">
                      {item.quantity}{item.category==='meat'?'g':item.category==='vege'?'개':''}
                    </span>
                    {item.expiry_date && (
                      <span className="expiry">
                        {new Date(item.expiry_date).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </div>
  );
}

export default FridgeList;