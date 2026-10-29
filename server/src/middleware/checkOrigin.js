import { HttpError } from './errorHandler.js'

const methodsThatChangeData = new Set(['POST', 'PUT', 'PATCH', 'DELETE'])

export function checkOrigin(request, _response, next) {
  const origin = request.get('origin')
  if (methodsThatChangeData.has(request.method) && origin && origin !== process.env.CLIENT_URL) {
    next(new HttpError(403, 'This request origin is not allowed.'))
    return
  }
  next()
}
