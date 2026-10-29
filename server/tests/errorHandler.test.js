import { test } from 'node:test'
import assert from 'node:assert/strict'
import { errorHandler, HttpError } from '../src/middleware/errorHandler.js'

function createResponse() {
  return {
    statusCode: 0,
    body: null,
    status(statusCode) {
      this.statusCode = statusCode
      return this
    },
    json(body) {
      this.body = body
      return this
    },
  }
}

test('error handler forwards safe application error messages for provider failures', () => {
  const response = createResponse()
  errorHandler(new HttpError(502, 'The AI provider could not complete the practice reply.'), {}, response, () => {})

  assert.equal(response.statusCode, 502)
  assert.deepEqual(response.body, {
    error: { message: 'The AI provider could not complete the practice reply.' },
  })
})

test('error handler keeps unexpected server error details private', () => {
  const response = createResponse()
  errorHandler(new Error('Sensitive internal details'), {}, response, () => {})

  assert.equal(response.statusCode, 500)
  assert.deepEqual(response.body, {
    error: { message: 'The server could not complete the request.' },
  })
})

test('error handler safely maps malformed input and common database errors', () => {
  const cases = [
    [{ type: 'entity.parse.failed' }, 400, /valid JSON/i],
    [{ type: 'entity.too.large' }, 413, /too large/i],
    [{ name: 'ValidationError' }, 400, /invalid data/i],
    [{ name: 'CastError' }, 400, /invalid data/i],
    [{ code: 11000 }, 409, /already exists/i],
    [{ name: 'MongoNetworkError' }, 503, /database is temporarily unavailable/i],
  ]

  for (const [error, statusCode, expectedMessage] of cases) {
    const response = createResponse()
    errorHandler(error, {}, response, () => {})

    assert.equal(response.statusCode, statusCode)
    assert.match(response.body.error.message, expectedMessage)
    assert.doesNotMatch(response.body.error.message, /MongoNetworkError|ValidationError|11000/)
  }
})

test('error handler delegates when response headers have already been sent', () => {
  let forwarded
  const error = new Error('Already streaming')
  errorHandler(error, {}, { headersSent: true }, (value) => { forwarded = value })
  assert.equal(forwarded, error)
})
