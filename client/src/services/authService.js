import { apiRequest } from './apiClient.js'

export async function restoreSession() {
  const result = await apiRequest('/api/auth/me')
  return result.user
}

export async function signup({ fullName, email, password }) {
  const result = await apiRequest('/api/auth/signup', {
    method: 'POST',
    body: JSON.stringify({ name: fullName, email, password }),
  })
  return result.user
}

export async function login(email, password) {
  const result = await apiRequest('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
  return result.user
}

export async function logout() {
  return apiRequest('/api/auth/logout', { method: 'POST' })
}

export async function updateProfile(preferredLearningLevel) {
  const result = await apiRequest('/api/auth/me', {
    method: 'PATCH',
    body: JSON.stringify({ preferredLearningLevel }),
  })
  return result.user
}
