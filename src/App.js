import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { HubConnectionBuilder } from '@microsoft/signalr';
import Login from './components/Login';
import Register from './components/Register';
import Chat from './components/Chat';
import Auth from './components/Auth';
import { getAuthData, clearAuthData } from './utils/auth';

const App = () => {
  const [token, setToken] = useState(null);
  const [username, setUsername] = useState('');
  const [connection, setConnection] = useState(null);

  useEffect(() => {
    // Check for stored auth data on component mount
    const authData = getAuthData();
    if (authData) {
      setToken(authData.token);
      setUsername(authData.username);
    }
  }, []);

  useEffect(() => {
    const createConnection = async () => {
      if (connection) {
        await connection.stop();
      }

      if (token) {
        const newConnection = new HubConnectionBuilder()
          .withUrl(`https://localhost:7099/messageHub?token=${token}`)
          .build();

        try {
          await newConnection.start();
          console.log('SignalR Connected');
          setConnection(newConnection);
        } catch (error) {
          console.error('Error starting SignalR connection:', error);
        }
      }
    };

    createConnection();

    return () => {
      if (connection) {
        connection.stop();
        console.log('SignalR Disconnected');
      }
    };
  }, [token]);

  const handleLogout = async () => {
    if (connection) {
      await connection.stop();
    }
    clearAuthData();
    setToken(null);
    setUsername('');
    setConnection(null);
  };

  return (
    <Router>
      <div>
        <header>
          <h1>ChatApp</h1>
          {token && (
            <div className="user-info">
              <span>Welcome, {username}!</span>
              <button onClick={handleLogout} className="logout-button">Logout</button>
            </div>
          )}
        </header>
        <Routes>
          <Route
            path="/"
            element={token ? <Navigate to="/chat" /> : <Auth setToken={setToken} setUsername={setUsername} />}
          />
          <Route path="/login" element={<Login setToken={setToken} setUsername={setUsername} />} />
          <Route path="/register" element={<Register setToken={setToken} setUsername={setUsername} />} />
          <Route
            path="/chat"
            element={token ? (
              <Chat connection={connection} token={token} username={username} onLogout={handleLogout} />
            ) : (
              <Navigate to="/" />
            )}
          />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
