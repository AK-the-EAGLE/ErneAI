import { apiRequest } from './apiClient.js'

export const api = {
  getScenarios: async () => (await apiRequest('/api/scenarios')),
  getPhrases: async (scenarioId, search = '') => {
    const query = new URLSearchParams()
    if (scenarioId) query.set('scenario', scenarioId)
    if (search.trim()) query.set('search', search.trim())
    const queryString = query.toString()
    return apiRequest(`/api/phrases${queryString ? `?${queryString}` : ''}`)
  },
  generatePhrases: async (input, signal) => apiRequest('/api/phrases/generate', {
    method: 'POST',
    body: JSON.stringify(input),
    signal,
  }),
  getFavorites: async () => apiRequest('/api/favorites'),
  addFavorite: async (item) => apiRequest('/api/favorites', {
    method: 'POST',
    body: JSON.stringify(item.kind === 'lesson'
      ? { type: 'lesson', lessonId: item.id }
      : { type: 'phrase', phraseId: item.id }),
  }),
  removeFavorite: async (favoriteId) => apiRequest(`/api/favorites/${encodeURIComponent(favoriteId)}`, {
    method: 'DELETE',
  }),
  getProgress: async () => apiRequest('/api/progress'),
  markScenarioVisited: async (scenario) => apiRequest('/api/progress', {
    method: 'PUT',
    body: JSON.stringify({ scenario }),
  }),
  getLessonProgress: async () => apiRequest('/api/progress/lessons'),
  setCurrentLesson: async (lessonId) => apiRequest('/api/progress/lessons/current', {
    method: 'PUT',
    body: JSON.stringify({ lessonId }),
  }),
  submitLessonAttempt: async (lessonId, answers) => apiRequest(`/api/progress/lessons/${encodeURIComponent(lessonId)}/attempts`, {
    method: 'POST',
    body: JSON.stringify({ answers }),
  }),
  generateSupplementaryLesson: async (topic) => apiRequest('/api/lessons/generate', {
    method: 'POST',
    body: JSON.stringify({ topic }),
  }),
  getSupplementaryLesson: async (lessonId, signal) => apiRequest(
    `/api/lessons/supplementary/${encodeURIComponent(lessonId)}`,
    { signal },
  ),
  respond: async (scenario, message, history) => apiRequest('/api/practice/respond', {
    method: 'POST',
    body: JSON.stringify({ scenario, message, history }),
  }),
}
