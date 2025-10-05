import { apiClient, setToken } from './client';

export async function register({ name, email, password, uniqueId }) {
  return apiClient.post('/users/register', { name, email, password, uniqueId });
}

export async function login({ email, password }) {
  const res = await apiClient.post('/users/login', { email, password });
  if (res.ok && (res.data?.payload?.token || res.data?.token)) {
    setToken(res.data?.payload?.token || res.data?.token);
  }
  return res;
}

export async function me() {
  return apiClient.get('/users/me');
}

export async function getAllUsers() {
  return apiClient.get('/users/all');
}
