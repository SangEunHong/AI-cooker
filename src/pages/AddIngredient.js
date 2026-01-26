import { useState } from 'react';
import apiClient from '../utils/api';
import '../style/Fridge.css';

function AddIngredient() {
  const [formData, setFormData] = useState({
    name: '',
    quantity: '',
    expiry_date: '',
    category: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleCategoryChange = (selectedCategory) => {
    setFormData({
      ...formData,
      category: selectedCategory
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.category) {
      alert("카테고리를 선택해주세요");
      return;
    }

    try {
      const response = await apiClient.post("/ingredients", formData);

      if (response.data.success) {
        alert("냉장고에 재료가 추가되었습니다");
        setFormData({ name: '', quantity: '', expiry_date: '', category: '' });
      }
    } catch (error) {
      console.error("재료 추가 실패:", error);
      alert("저장에 실패했습니다. 다시 시도해주세요.");
    }
  };

  return (
    <div className="fridgeList">

      <main className="AddListB">
          <div> 
            <h1>재료 추가</h1>
            
            <div className="AddListS">
              <label className="category-choice">
                <input 
                  type="checkbox" 
                  checked={formData.category === 'meat'}
                  onChange={() => handleCategoryChange('meat')} 
                /> 육류
              </label>
              <label className="category-choice">
                <input 
                  type="checkbox" 
                  checked={formData.category === 'vegetable'} 
                  onChange={() => handleCategoryChange('vegetable')} 
                /> 채소
              </label>
              <label className="category-choice">
                <input 
                  type="checkbox" 
                  checked={formData.category === 'processed'} 
                  onChange={() => handleCategoryChange('processed')} 
                /> 가공육
              </label>
            </div>

            <div className="added-item">
              <label>이름 : </label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} required />
            </div>

            <div className="added-item">
              <label>양 : </label>
              <input type="number" name="quantity" value={formData.quantity} onChange={handleChange} required />
            </div>

            <div className="added-item">
              <label>유통기한 : </label>
              <input type="date" name="expiry_date" value={formData.expiry_date} onChange={handleChange} required />
            </div>

            <button className="btn-submit" onClick={handleSubmit}>냉장고에 넣기</button>
          </div> 
      </main>

    </div>
  );
}

export default AddIngredient;