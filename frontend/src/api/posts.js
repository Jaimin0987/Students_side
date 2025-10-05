import { apiClient } from './client';

export async function getAllPosts() {
  // Backend uses POST for list
  return apiClient.post('/posts/', {});
}

export async function getMyPosts() {
  return apiClient.post('/posts/my', {});
}

export async function getTrendingPosts() {
  return apiClient.post('/posts/trending', {});
}

export async function createPost({ title, description, imageFile, group }) {
  const formData = new FormData();
  formData.append('title', title);
  formData.append('description', description);
  formData.append('group', group || '');
  if (imageFile) {
    formData.append('image', imageFile);
  }
  
  const token = localStorage.getItem('token');
  const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/posts/create`, {
    method: 'POST',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: formData,
  });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, data };
}

export async function likePost({ postId }) {
  return apiClient.post('/posts/like', { postId });
}

export async function dislikePost({ postId }) {
  return apiClient.post('/posts/dislike', { postId });
}

export async function deletePost({ postId }) {
  return apiClient.del('/posts/delete', { postId });
}


