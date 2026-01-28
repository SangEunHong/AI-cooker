// App.js
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext'; // 👈 가져오기
import { NotificationProvider } from './context/NotificationContext'; // 👈 가져오기
import Login from './pages/Login';
import Fridge from './pages/Fridge';
import Register from './pages/Register';

function App() {
  return (
    // 1. 알림 시스템 연결
    <NotificationProvider>
      {/* 2. 로그인 시스템 연결 */}
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/fridge" element={<Fridge />} />
            <Route path="/register" element={<Register />} />
            {/* 기본 접속 시 로그인으로 가도록 설정 */}
            <Route path="/" element={<Fridge />} />
          </Routes>
        </Router>
      </AuthProvider>
    </NotificationProvider>
  );
}

export default App;