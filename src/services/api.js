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
    const response = await axios.get(`${API_URL}/Chat/GetPaginatedChat`, {
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
    const response = await axios.get(`${API_URL}/Chat/ParaphraseMessage`, {
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
    const response = await axios.get(`${API_URL}/Chat/CheckGrammar`, {
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

export const uploadPdfFile = async (file, token) => {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await axios.post(
      `${API_URL}/File/Upload`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Error uploading file:', error);
    return {
      success: false,
      error: error.response?.data?.message || 'File upload failed',
    };
  }
};
