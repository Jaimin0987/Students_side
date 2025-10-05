import { apiClient } from './client';

export async function getAllCommunities() {
  return apiClient.post('/community/', {});
}

export async function getMyCommunities() {
  return apiClient.post('/community/my', {});
}

export async function createCommunity({ name, info, communityType }) {
  return apiClient.post('/community/create', { name, info, communityType });
}

export async function joinCommunity({ commId }) {
  return apiClient.post('/community/join', { commId });
}

export async function leaveCommunity({ commId }) {
  return apiClient.post('/community/leave', { commId });
}

export async function getCommunity({ commId }) {
  return apiClient.post('/community/getOne', { commId });
}

export async function getPendingRequests({ commId }) {
  return apiClient.post('/community/requests', { commId });
}

export async function approveMember({ commId, memberId }) {
  return apiClient.post('/community/approve', { commId, memberId });
}

export async function deleteCommunity(commId) {
  return apiClient.del('/community/', { commId });
}

export async function requestToJoin({ commId }) {
  return apiClient.post('/community/request', { commId });
}

export async function rejectMember({ commId, memberId }) {
  return apiClient.post('/community/reject', { commId, memberId });
}
