import { apiClient } from './client';

export async function getChats(receiverId) {
  return apiClient.get(`/chats/${receiverId}`);
}

export async function sendChat({ receiverId, message }) {
  return apiClient.post('/chats/create', { receiverId, message });
}

export async function deleteChat(chatId) {
  return apiClient.del(`/chats/${chatId}`);
}


