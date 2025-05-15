import axios from 'axios';

const API_URL = 'https://localhost:7099/api';

export const registerUser = async (username, password) => {
  try {
    const response = await axios.post(`${API_URL}/Auth/register`, { username, password });
    return { success: true, data: response.data };
  } catch (error) {
    console.error("Error during registration:", error);
    return { 
      success: false, 
      error: error.response?.data?.message || error.response?.data || 'An error occurred during registration'
    };
  }
};

export const loginUser = async (username, password) => {
  try {
    const response = await axios.post(`${API_URL}/Auth/login`, { username, password });
    return { success: true, data: response.data };
  } catch (error) {
    console.error("Error during login:", error);
    return { 
      success: false, 
      error: error.response?.data?.message || error.response?.data || 'An error occurred during login'
    };
  }
};

export const initializeChat = async (chatName, token) => {
  try {
    const response = await axios.post(`${API_URL}/Chat/GetPaginatedChat`, null, {
      params: {
        chatName: chatName,
        pageNumber: 1,
        pageSize: 20,
      },
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error("Error initializing chat:", error);
  }
};
