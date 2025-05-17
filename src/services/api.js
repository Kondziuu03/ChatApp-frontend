import axios from 'axios';

const API_URL = 'https://localhost:7099/api';

const formatErrors = (errorResponse) => {
  if (errorResponse?.errors) {
    const errorMessages = [];
    Object.entries(errorResponse.errors).forEach(([field, messages]) => {
      messages.forEach(message => {
        errorMessages.push(`${message}`);
      });
    });
    return errorMessages.join('\n');
  }
  return errorResponse?.message || errorResponse || 'An error occurred';
};

export const registerUser = async (username, password) => {
  try {
    const response = await axios.post(`${API_URL}/Auth/register`, { username, password });
    return { success: true, data: response.data };
  } catch (error) {
    console.error("Error during registration:", error);
    return { 
      success: false, 
      error: formatErrors(error.response?.data)
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
      error: formatErrors(error.response?.data)
    };
  }
};

export const initializeChat = async (chatName, token, pageNumber = 1, pageSize = 20) => {
  try {
    const response = await axios.post(`${API_URL}/Chat/GetPaginatedChat`, null, {
      params: {
        chatName,
        pageNumber,
        pageSize,
      },
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return { success: true, data: response.data };
  } catch (error) {
    console.error("Error initializing chat:", error);
    return { 
      success: false, 
      error: formatErrors(error.response?.data)
    };
  }
};

export const paraphraseMessage = async (message, token, style = 'standard') => {
  try {
    const response = await axios.post(`${API_URL}/Chat/ParaphraseMessage`, null, {
      params: {
        message: message,
        style: style
      },
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return { success: true, data: response.data };
  } catch (error) {
    console.error("Error during paraphrasing:", error);
    return { 
      success: false, 
      error: formatErrors(error.response?.data)
    };
  }
};

export const checkGrammar = async (message, token) => {
  try {
    const response = await axios.post(`${API_URL}/Chat/CheckGrammar`, null, {
      params: {
        message: message
      },
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return { success: true, data: response.data };
  } catch (error) {
    console.error("Error during grammar check:", error);
    return { 
      success: false, 
      error: formatErrors(error.response?.data)
    };
  }
};
