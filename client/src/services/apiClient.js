const apiBaseUrl = (import.meta.env?.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '')

export class ApiError extends Error {
  constructor(message, status) {
    super(message)
    this.status = status
  }
}

export async function apiRequest(path, options = {}) {
  let response
  try {
    response = await fetch(`${apiBaseUrl}${path}`, {
      ...options,
      credentials: 'include',
      headers: {
        ...(options.body ? { 'Content-Type': 'application/json' } : {}),
        ...options.headers,
      },
    })
  } catch {
    throw new ApiError('Could not connect to Erne AI. Check that the backend is running and try again.', 0)
  }

  let result
  try {
    result = await response.json()
  } catch {
    throw new ApiError('The backend returned a response that could not be read.', response.status)
  }

  if (!response.ok) {
    throw new ApiError(result.error?.message || `Request failed with status ${response.status}.`, response.status)
  }

  return result.data
}
