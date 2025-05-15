import React, { useState } from 'react';
import { registerUser, loginUser } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { saveAuthData } from '../utils/auth';
import './Auth.css';

const Register = ({ setToken, setUsername }) => {
  const [username, setLocalUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRegister = async () => {
    setError(''); // Clear any previous errors
    const registerResult = await registerUser(username, password);
    
    if (registerResult.success) {
      const loginResult = await loginUser(username, password);
      if (loginResult.success && loginResult.data.token) {
        saveAuthData(loginResult.data.token, username, loginResult.data.expiredDate);
        setToken(loginResult.data.token);
        setUsername(username);
        navigate('/chat');
      } else {
        setError(loginResult.error || 'Failed to login after registration');
      }
    } else {
      setError(registerResult.error);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>Register</h2>
        {error && <div className="error-message">{error}</div>}
        <input 
          type="text" 
          value={username} 
          onChange={(e) => setLocalUsername(e.target.value)} 
          placeholder="Username" 
        />
        <input 
          type="password" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          placeholder="Password" 
        />
        <button onClick={handleRegister}>Register</button>
        <p>Already have an account? <a href="/login">Login</a></p>
      </div>
    </div>
  );
};

export default Register;
