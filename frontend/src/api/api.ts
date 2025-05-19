export const authFetch = (url: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('authToken');

  return fetch(url, {
    ...options,
    headers: {
      ...(options.headers || {}),
      'Authorization': token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json',
    },
  });
};

export const login = (body: { username: string; password: string }) =>
  fetch('http://127.0.0.1:8000/api/v1/users/login/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

export const register = (body: { email: string; password: string }) =>
  fetch('http://127.0.0.1:8000/api/v1/users/register/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

export const getDreams = () =>
  authFetch('http://127.0.0.1:8000/api/v1/dreams/');
