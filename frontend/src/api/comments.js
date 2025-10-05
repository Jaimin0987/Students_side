import { apiClient } from './client';

export async function getComments({ postId, commentId = 'NONE' }) {
  return apiClient.get(`/comments/${postId}/${commentId}`);
}

export async function postComment({ message, imgUrl, postId, parentCommentId = null }) {
  return apiClient.post('/comments/create', { message, imgUrl, postId, parentCommentId });
}

export async function likeComment({ id }) {
  return apiClient.post('/comments/like', { id });
}

export async function dislikeComment({ id }) {
  return apiClient.post('/comments/dislike', { id });
}

export async function deleteComment({ id }) {
  return apiClient.del('/comments/', { id });
}


