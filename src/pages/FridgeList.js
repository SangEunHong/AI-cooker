import { useState, useEffect } from 'react';
import apiClient from '../utils/api';
import '../style/Fridge.css';

function FridgeList({category}) {
  const [ingredients, setIngredients] = useState([]); 
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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

  const filterIngredients = ingredients.filter(item => item.category === category);

  if (loading) return <div className="LoadingList">냉장고 확인 중...</div>;

  return (
    <div className="fridge-container">
      <main className="ingredientListB">
        <div>
          <h1>나의 냉장고</h1>
          <div className="ingredientListS">
            {filterIngredients.length === 0 ? (
              <p>{category==='meat'?'육류':category==='vege'  ?  '채소':'가공육'}이(가) 없어요.</p>
              ) : (

                <ul className="ingredient-list">
                  {filterIngredients.map(item => (
                    <li key={item.id}>{item.name} - {item.quantity}개</li>
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