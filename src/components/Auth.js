import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Auth.css'; // Importujemy zaktualizowane style

const Auth = ({ setToken }) => {
  const navigate = useNavigate();

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>Welcome to ChatApp</h2>  {/* Dodajemy powitanie */}
        <div className="auth-buttons">
          <button onClick={() => navigate('/login')} className="auth-button">Login</button>
          <button onClick={() => navigate('/register')} className="auth-button">Register</button>
        </div>
      </div>
    </div>
  );
};

export default Auth;
