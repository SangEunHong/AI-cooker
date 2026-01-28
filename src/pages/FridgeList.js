import { useState, useEffect } from 'react';
import apiClient from '../utils/api';
import '../style/Fridge.css';

function FridgeList() {
  const [ingredients, setIngredients] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('');


  useEffect(() => {
    document.body.style.backgroundColor = '#fff8e1';
    document.body.style.margin = '0';
    const fetchIngredients = async () => {
      try {
        const response = await apiClient.get("/ingredients");
        setIngredients(response.data);
      } catch (error) {
        console.error("재료를 가져오는데 실패했습니다:", error);
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
    prev.includes(cat)
      ? prev.filter(c => c !== cat) // 이미 선택돼 있으면 제거
      : [...prev, cat]              // 선택 안 돼 있으면 추가
  );
};

  if (loading) return <div className="LoadingList">냉장고 확인 중...</div>;

  return (
    <div className="fridge-container">
      <main className="ingredientListB">
        <div>
          <header className="fridge-header"><h1>나의 냉장고</h1>

          <div className="AddListS">
            <label className="category-choice">
              <input 
                type="checkbox" 
                checked={category.includes('meat')}
                onChange={() => toggleCategory('meat')}
              /> 육류
            </label>
            <label className="category-choice">
              <input 
                type="checkbox" 
                checked={category.includes('vege')} 
                onChange={() => toggleCategory('vege')}
              /> 채소
            </label>
            <label className="category-choice">
              <input 
                type="checkbox" 
                checked={category.includes('sauce')} 
                onChange={() => toggleCategory('sauce')}
              /> 소스
            </label>
          </div></header>

          <div className="ingredientListS">
            {filterIngredients.length === 0 ? (
              <p>재료가 없어요.</p>
              ) : (

                <ul className="ingredient-list">
                  {filterIngredients.map(item => (
                    <li key={item.id} className="ingredient-item">
                      <div className="info">
                        <div className="left-group">
                          <span className="name">{item.name}</span>
                          <span className="quantity">
                            {item.quantity}{item.category==='meat'?'g':item.category==='vege'?'개':''}
                          </span>
                        </div>

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
        </div>
      </main>
    </div>
  );
}

export default FridgeList;