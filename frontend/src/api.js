const API_BASE = import.meta.env.VITE_API_URL || '';

export const api = {
  get: (path, token) =>
    fetch(`${API_BASE}${path}`, {
      headers: { Authorization: `Bearer ${token}` },
    }),

  post: (path, body, token) =>
    fetch(`${API_BASE}${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(body),
    }),

  put: (path, body, token) =>
    fetch(`${API_BASE}${path}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    }),

  delete: (path, token) =>
    fetch(`${API_BASE}${path}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    }),
};

export default api;
