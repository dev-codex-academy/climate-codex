const env = import.meta.env.VITE_ENV;

export const API_URL =
  env === 'production'
    ? import.meta.env.VITE_API_PROD
    : import.meta.env.VITE_API_DEV;

// Headers for all API requests — token is in the HttpOnly cookie, not here
export const getHeaders = () => ({
  'Content-Type': 'application/json',
});

// Global fetch interceptor:
// 1. Adds credentials: 'include' to requests aimed at our own API so the
//    browser sends the auth cookie — scoped to API_URL, not every fetch
//    call, in case a future call goes to a third-party service that
//    doesn't return Access-Control-Allow-Credentials (which would
//    otherwise fail CORS).
// 2. Fires auth:token-expired on 401 so AuthContext can trigger logout.
// Excludes /login/ (wrong-password responses aren't a session expiry) and
// /me/ (AuthContext's own unauthenticated session probe on mount — a 401
// there just means "not logged in yet", not "an active session died").
// Without the /me/ exclusion, every page load without a cookie would fire
// this event, which calls logout(), which itself 401s and refires the
// event in a loop.
const _originalFetch = window.fetch.bind(window);
window.fetch = async (url, options = {}) => {
  const urlStr = String(url);
  const mergedOptions = urlStr.startsWith(API_URL)
    ? { credentials: 'include', ...options }
    : options;
  const response = await _originalFetch(url, mergedOptions);
  if (
    response.status === 401 &&
    !urlStr.includes('/login/') &&
    !urlStr.includes('/me/')
  ) {
    window.dispatchEvent(new CustomEvent('auth:token-expired'));
  }
  return response;
};
