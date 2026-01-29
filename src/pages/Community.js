import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import '../style/Fridge.css';

function Community() {
  return (
    <div className="fridgeList">
      <main className="AddListB">
        <h1>아직 준비중이에요😉</h1>
      </main>
    </div>
  );
}

export default Community;