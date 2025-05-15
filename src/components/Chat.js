import React, { useState, useEffect, useRef } from 'react';
import { initializeChat } from '../services/api';
import './Chat.css';

const Chat = ({ token, connection, username }) => {
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [chatId, setChatId] = useState(null);
  const [chatName, setChatName] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (connection) {
      connection.on('ReceiveMessage', (user, message) => {
        console.log('Received message:', { user, message });

        setChatMessages(prevMessages => [
          ...prevMessages,
          { username: user, text: message }
        ]);
      });
    }

    const fetchChat = async () => {
      try {
        const chatData = await initializeChat('Global', token);
        if (chatData && chatData.messages && chatData.id) {
          setChatMessages(chatData.messages);
          setChatId(chatData.id);
          setChatName(chatData.name);
        } else {
          console.error('Chat data or messages are undefined');
        }
      } catch (error) {
        console.error('Error fetching chat data:', error);
      }
    };

    fetchChat();

    return () => {
      if (connection) {
        connection.off('ReceiveMessage');
      }
    };
  }, [token, connection]);

  const handleSendMessage = () => {
    if (newMessage && chatId) {
      connection.send('SendMessageToChat', chatId, newMessage)
        .catch((err) => {
          console.log("Error sending message: ", err);
        });
      setNewMessage('');
    } else {
      alert("Connection is not established or chatId is undefined. Please try again later.");
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  return (
    <div className="chat-container">
      <div className="chat-box">
        <h2>Chat - {chatName}</h2>
        <div className="messages">
          {chatMessages.length > 0 ? (
            chatMessages.map((msg, index) => (
              <div
                key={index}
                className={`message ${msg.username === username ? 'right' : 'left'}`}
              >
                <strong>{msg.username === username ? 'You' : msg.username}</strong>: {msg.text}
              </div>
            ))
          ) : (
            <p>No messages yet</p>
          )}
          <div ref={messagesEndRef} />
        </div>
        <div className="input-container">
          <input 
            type="text" 
            value={newMessage} 
            onChange={(e) => setNewMessage(e.target.value)} 
            placeholder="Type a message..."
          />
          <button onClick={handleSendMessage}>Send</button>
        </div>
      </div>
    </div>
  );
};

export default Chat;
