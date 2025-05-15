export const saveAuthData = (token, username, expiredDate) => {
  localStorage.setItem('token', token);
  localStorage.setItem('username', username);
  localStorage.setItem('tokenExpiration', expiredDate);
};

export const clearAuthData = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('username');
  localStorage.removeItem('tokenExpiration');
};

export const getAuthData = () => {
  const token = localStorage.getItem('token');
  const username = localStorage.getItem('username');
  const tokenExpiration = localStorage.getItem('tokenExpiration');

  if (!token || !tokenExpiration) {
    return null;
  }

  // Check if token is expired
  if (new Date(tokenExpiration).getTime() <= new Date().getTime()) {
    clearAuthData();
    return null;
  }

  return {
    token,
    username,
    tokenExpiration
  };
}; 