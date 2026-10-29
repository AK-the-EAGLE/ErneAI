export class HttpError extends Error {
  constructor(status, message) {
    super(message)
    this.status = status
  }
}

export function asyncHandler(handler) {
  return (request, response, next) => Promise.resolve(handler(request, response, next)).catch(next)
}

function getErrorResponse(error) {
  if (error instanceof HttpError) return { status: error.status, message: error.message }

  if (error?.type === 'entity.parse.failed') {
    return { status: 400, message: 'The request body must contain valid JSON.' }
  }
  if (error?.type === 'entity.too.large') {
    return { status: 413, message: 'The request body is too large.' }
  }
  if (error?.name === 'ValidationError' || error?.name === 'CastError') {
    return { status: 400, message: 'The request contains invalid data.' }
  }
  if (error?.code === 11000) {
    return { status: 409, message: 'A record with that value already exists.' }
  }
  if (
    ['MongooseServerSelectionError', 'MongoNetworkError', 'MongoNetworkTimeoutError'].includes(error?.name)
    || error?.code === 'ECONNREFUSED'
    || (error?.name === 'MongooseError' && /buffering timed out/i.test(error.message || ''))
  ) {
    return { status: 503, message: 'The database is temporarily unavailable. Please try again later.' }
  }

  return { status: 500, message: 'The server could not complete the request.' }
}

export function errorHandler(error, _request, response, next) {
  if (response.headersSent) {
    next(error)
    return
  }

  const { status, message } = getErrorResponse(error)
  if (status >= 500) {
    const code = error?.code
    const safeCode = typeof code === 'number'
      || (typeof code === 'string' && /^[A-Za-z0-9_.-]{1,64}$/.test(code))
    const name = typeof error?.name === 'string' && /^[A-Za-z0-9_.-]{1,64}$/.test(error.name)
      ? error.name
      : 'Error'
    console.error('API request failed.', {
      status,
      name,
      ...(safeCode ? { code } : {}),
    })
  }

  response.status(status).json({ error: { message } })
}
