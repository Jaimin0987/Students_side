const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

async function request(path, { method = 'GET', headers = {}, body } = {}) {
  const token = localStorage.getItem('token');
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, data };
}

export const apiClient = {
  get: (path) => request(path, { method: 'GET' }),
  post: (path, body) => request(path, { method: 'POST', body }),
  del: (path, body) => request(path, { method: 'DELETE', body }),
};

export function setToken(token) {
  localStorage.setItem('token', token);
}

export function clearToken() {
  localStorage.removeItem('token');
}