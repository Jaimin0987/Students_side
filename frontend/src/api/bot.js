import { apiClient } from './client';

export async function sendBotMessage(request) {
  return apiClient.post('/bot/chat', { request });
}
