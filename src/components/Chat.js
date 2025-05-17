import React, { useState, useEffect, useRef } from 'react';
import { initializeChat, paraphraseMessage, checkGrammar } from '../services/api';
import './Chat.css';

const Chat = ({ token, connection, username }) => {
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [chatId, setChatId] = useState(null);
  const [chatName, setChatName] = useState('');
  const [error, setError] = useState('');
  const [isParaphrasing, setIsParaphrasing] = useState(false);
  const [paraphraseStyle, setParaphraseStyle] = useState('standard');
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const PAGE_SIZE = 20;
  const [shouldScrollToBottom, setShouldScrollToBottom] = useState(false);
  const [isCheckingGrammar, setIsCheckingGrammar] = useState(false);

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [newMessage]);

  const loadMessages = async (page) => {
    try {
      setIsLoading(true);
      const result = await initializeChat('Global', token, page, PAGE_SIZE);
      
      if (result.success && result.data) {
        const { messages, id, name } = result.data;
        
        // If we get fewer messages than PAGE_SIZE or no messages, there are no more to load
        setHasMore(messages.length === PAGE_SIZE);

        if (messages.length === 0) {
          return;
        }

        setChatMessages(prevMessages => {
          // Ensure newest messages are at the bottom by reversing the incoming messages
          const newMessages = [...messages].reverse();
          
          if (page === 1) {
            return newMessages; // For first page, set reversed messages
          }
          
          // For subsequent pages, add older messages at the top
          const existingIds = new Set(prevMessages.map(msg => msg.id));
          const uniqueNewMessages = newMessages.filter(msg => !existingIds.has(msg.id));
          return [...uniqueNewMessages, ...prevMessages];
        });

        if (page === 1) {
          setChatId(id);
          setChatName(name);
        }
      } else {
        setError(result.error || 'Failed to load messages');
      }
    } catch (error) {
      console.error('Error loading messages:', error);
      setError('Failed to load messages');
    } finally {
      setIsLoading(false);
    }
  };

  // Load initial messages when component mounts or token changes
  useEffect(() => {
    if (token) {
      loadMessages(1);
    }
  }, [token]); // Add token as dependency

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    // Scroll to bottom on initial load
    if (currentPage === 1 && chatMessages.length > 0) {
      scrollToBottom();
    }
  }, [chatMessages, currentPage]);

  useEffect(() => {
    if (connection) {
      connection.on('ReceiveMessage', (user, message) => {
        console.log('Received message:', { user, message });
        setChatMessages(prevMessages => [
          ...prevMessages,
          { username: user, text: message }  // Add new messages at the bottom
        ]);
        setShouldScrollToBottom(true); // Trigger scroll only for new messages
      });
    }

    return () => {
      if (connection) {
        connection.off('ReceiveMessage');
      }
    };
  }, [connection]);

  useEffect(() => {
    if (shouldScrollToBottom && chatMessages.length > 0) {
      scrollToBottom();
      setShouldScrollToBottom(false);
    }
  }, [shouldScrollToBottom, chatMessages]);

  const handleLoadMore = () => {
    if (!isLoading && hasMore) {
      const nextPage = Math.floor(chatMessages.length / PAGE_SIZE) + 1;
      setCurrentPage(nextPage);
      loadMessages(nextPage);
    }
  };

  const handleParaphrase = async () => {
    if (!newMessage.trim()) return;

    setIsParaphrasing(true);
    setError('');
    
    const result = await paraphraseMessage(newMessage, token, paraphraseStyle);
    
    setIsParaphrasing(false);
    
    if (result.success) {
      setNewMessage(result.data.message);
    } else {
      setError(result.error);
    }
  };

  const handleCheckGrammar = async () => {
    if (!newMessage.trim()) return;

    setIsCheckingGrammar(true);
    setError('');
    
    const result = await checkGrammar(newMessage, token);
    
    setIsCheckingGrammar(false);
    
    if (result.success) {
      setNewMessage(result.data.message);
    } else {
      setError(result.error);
    }
  };

  const handleSendMessage = () => {
    if (newMessage && chatId) {
      connection.send('SendMessageToChat', chatId, newMessage)
        .catch((err) => {
          console.log("Error sending message: ", err);
          setError("Failed to send message. Please try again.");
        });
      setNewMessage('');
      setError('');
      setShouldScrollToBottom(true); // Scroll to bottom after sending a message
    } else {
      setError("Connection is not established or chatId is undefined. Please try again later.");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-box">
        <h2>Chat - {chatName}</h2>
        <div className="messages">
          <div className="messages-header">
            {hasMore && (
              <button 
                className="load-more-button"
                onClick={handleLoadMore}
                disabled={isLoading}
              >
                {isLoading ? 'Loading...' : 'Load More Messages'}
              </button>
            )}
          </div>
          <div className="messages-content">
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
        </div>
        {error && <div className="error-message">{error}</div>}
        <div className="input-container">
          <textarea
            ref={textareaRef}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            rows={1}
          />
          <div className="message-controls">
            <div className="paraphrase-controls">
              <select
                value={paraphraseStyle}
                onChange={(e) => setParaphraseStyle(e.target.value)}
                className="paraphrase-style-select"
              >
                <option value="formal">Formal</option>
                <option value="standard">Standard</option>
                <option value="simplified">Simplified</option>
              </select>
              <button 
                onClick={handleParaphrase} 
                disabled={isParaphrasing || !newMessage.trim()}
                className="paraphrase-button"
              >
                {isParaphrasing ? 'Paraphrasing...' : 'Paraphrase'}
              </button>
            </div>
            <button 
              onClick={handleCheckGrammar}
              disabled={isCheckingGrammar || !newMessage.trim()}
              className="grammar-check-button"
            >
              {isCheckingGrammar ? 'Checking...' : 'Check Grammar'}
            </button>
          </div>
          <button 
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat;
