const env = import.meta.env.VITE_ENV;

export const API_URL =
  env === 'production'
    ? import.meta.env.VITE_API_PROD
    : import.meta.env.VITE_API_DEV;

// Header with token updated every time
export const getHeaders = () => {
  const token = localStorage.getItem('auth_token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Token ${token}` })
  };
};

// Global 401 interceptor — fires a custom event when any API call returns 401.
// AuthContext listens for this event and triggers logout automatically.
// Excludes the login endpoint to avoid interfering with wrong-password responses.
const _originalFetch = window.fetch.bind(window);
window.fetch = async (url, ...args) => {
  const response = await _originalFetch(url, ...args);
  if (response.status === 401 && !String(url).includes('api-token-auth')) {
    window.dispatchEvent(new CustomEvent('auth:token-expired'));
  }
  return response;
};
