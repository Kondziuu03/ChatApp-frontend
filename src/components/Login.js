import React, { useState } from 'react';
import { loginUser } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { saveAuthData } from '../utils/auth';

const Login = ({ setToken, setUsername }) => {
  const [username, setLocalUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    setError(''); // Clear any previous errors
    const result = await loginUser(username, password);
    if (result.success && result.data.token) {
      saveAuthData(result.data.token, username, result.data.expiredDate);
      setToken(result.data.token);
      setUsername(username);
      navigate('/chat');
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>Login</h2>
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
        <button onClick={handleLogin}>Login</button>
        <p>Don't have an account? <a href="/register">Register</a></p>
      </div>
    </div>
  );
};

export default Login;
