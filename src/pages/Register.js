import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import '../style/Login.css';

function Register() {
  const [formData, setFormData] = useState({
    email: '',
    password_hash: '',
    nickname: '',
    age: '',
    gender: ''
  });

  const [error, setError] = useState('');
  const { register } = useAuth();
  const { addNotification } = useNotification();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');


    if (formData.password_hash.length < 4) {
      setError('비밀번호는 4자리 이상이어야 합니다.');
      addNotification('비밀번호는 4자리 이상이어야 합니다.', 'error');
      return;
    }

    if (isNaN(formData.age)) {
      setError('숫자만 입력해주세요');
      addNotification('숫자만 입력해주세요', 'error');
      return;
    }

    if (!formData.gender) {
      setError('성별을 선택해주세요');
      return;
    }

    const result = await register({
      email: formData.email,
      password: formData.password,
      nickname: formData.nickname,
      age: Number(formData.age),
      gender: formData.gender
  });

    if (result.success) {
      addNotification('회원가입 성공! 로그인해주세요.', 'success');
      navigate('/login');
    } else {
      setError(result.error);
      addNotification(result.error, 'error');
    }
  };

  return (
    <div className="auth-container">
      
      
      <div className="auth-form-wrapper">
        <h1>Sign in</h1>
      
        {error && <div className="error-message">{error}</div>}
      
        <form onSubmit={handleSubmit} className="auth-form">
          
          <div className="form-group">
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="이메일"
              required
            />
          </div>
          
          <div className="form-group">
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="비밀번호"
              required
            />
          </div>
          
          <div className="form-group">
            <input
              type="text"
              name="nickname"
              value={formData.nickname}
              onChange={handleChange}
              placeholder="닉네임"
              required
            />
          </div>

          <div className="form-group">
            <input
              type="number"
              name="age"
              value={formData.age}
              onChange={handleChange}
              placeholder="나이"
              required
            />
          </div>

          <div className="form-group">
            <label>성별</label>
            <div className="gender-buttons">
              <button
                type="button"
                className={formData.gender==='M'?'active': ''}
                onClick={()=> setFormData({...formData,gender: 'M'})}>
                  남성
              </button>
              <button
                type="button"
                className={formData.gender==='F'?'active': ''}
                onClick={()=> setFormData({...formData,gender: 'F'})}>
                  여성
              </button>
            </div>
          </div>

          
          <button type="submit" className="btn btn-primary">
            가입하기
          </button>
        </form>
        
        <p className="auth-link">
          이미 계정이 있나요? <Link to="/Login">로그인하기</Link>
        </p>

      </div>

    </div>
  );
}

export default Register;