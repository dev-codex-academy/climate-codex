const env = import.meta.env.VITE_ENV;

export const API_URL =
  env === 'production'
    ? import.meta.env.VITE_API_PROD
    : import.meta.env.VITE_API_DEV;

// Header con token actualizado cada vez
export const getHeaders = () => {
  const token = localStorage.getItem('auth_token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Token ${token}` })
  };
};
