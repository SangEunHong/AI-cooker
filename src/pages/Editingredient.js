import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../utils/api';
import '../style/Fridge.css';

function EditIngredient() {
  const navigate = useNavigate();
  const [ingredients, setIngredients] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    quantity: '',
    expiry_date: '',
    category: ''
  });

  const fetchAll = async () => {
    try {
      const response = await apiClient.get("/ingredients");
      setIngredients(response.data);
    } catch (err) {
      console.error("목록 로드 실패", err);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const resetForm = () => {
    setSelectedId('');
    setFormData({ name: '', quantity: '', expiry_date: '', category: '' });
    fetchAll();
  };

  const handleSelectChange = (e) => {
    const id = e.target.value;
    setSelectedId(id);
    if (!id) {
      setFormData({ name: '', quantity: '', expiry_date: '', category: '' });
      return;
    }
    const selectedItem = ingredients.find(item => String(item.id) === String(id));
    if (selectedItem) {
      setFormData({
        name: selectedItem.name || '',
        category: selectedItem.category || '',
        quantity: selectedItem.quantity || '',
        expiry_date: selectedItem.expiry_date ? selectedItem.expiry_date.split('T')[0] : ''
      });
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedId) return alert("재료를 선택해주세요.");
    try {
      const response = await apiClient.put(`/ingredients/${selectedId}`, formData);
      if (response.data.success) {
        alert("수정되었습니다!");
        resetForm();
      }
    } catch (error) {
      alert("수정 실패");
    }
  };

  const handleDelete = async () => {
    if (!selectedId) return alert("삭제할 재료를 선택해주세요.");
    if (window.confirm("정말로 삭제하시겠습니까?")) {
      try {
        const response = await apiClient.delete(`/ingredients/${selectedId}`);
        if (response.data.success) {
          alert("삭제되었습니다.");
          resetForm();
        }
      } catch (error) {
        alert("삭제 실패");
      }
    }
  };

  return (
    <div className="fridgeList">
      <main className="AddListB">
        <div>
          <h1>재료 관리</h1>
          <div className="added-item">
            <label>수정/삭제 대상 : </label>
            <select value={selectedId} onChange={handleSelectChange} className="category-select">
              <option value="">-- 재료를 선택하세요 --</option>
              {ingredients.map(item => (
                <option key={item.id} value={item.id}>{item.name}</option>
              ))}
            </select>
          </div>

          <hr />

          <div className="AddListS">
            {['meat', 'vege', 'sauce'].map((cat) => (
              <label key={cat} className="category-choice">
                <input 
                  type="checkbox" 
                  checked={formData.category === cat}
                  onChange={() => setFormData({...formData, category: cat})} 
                /> {cat === 'meat' ? '육류' : cat === 'vege' ? '채소' : '소스'}
              </label>
            ))}
          </div>

          <div className="added-item">
            <label>이름 : </label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} />
          </div>

          <div className="added-item">
            <label>양 : </label>
            <input type="number" name="quantity" value={formData.quantity} onChange={handleChange} />
          </div>

          <div className="added-item">
            <label>유통기한 : </label>
            <input type="date" name="expiry_date" value={formData.expiry_date} onChange={handleChange} />
          </div>

          <div className="button-container">
            <button className="btn-submit" onClick={handleSubmit}>수정 완료</button>
            <button className="btn-delete" onClick={handleDelete}>삭제</button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default EditIngredient;