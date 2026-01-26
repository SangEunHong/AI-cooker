import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import '../style/Login.css';

function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const { login } = useAuth();
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

    const result = await login(formData.email, formData.password);

    if (result.success) {
      addNotification('로그인 되었습니다', 'success');
      navigate('/Fridge');
    } else {
      addNotification(result.error, 'error');
    }
  };

  return (
    <div className="auth-container">
      
      
      {error && <div className="error-message">{error}</div>}
      <div className="auth-form-wrapper">
        <h1>Log in</h1>
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
          
          <button type="submit" className="btn btn-primary">
            로그인하기
          </button>
        </form>
        
        <p className="auth-link">
          계정이 없나요? <Link to="/Register">가입하기</Link>
        </p>
      </div>
    </div>
      
  );
}

export default Login;