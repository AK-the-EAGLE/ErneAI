import { after, before, test } from 'node:test'
import assert from 'node:assert/strict'

process.env.CLIENT_URL = 'http://localhost:5173'
process.env.JWT_SECRET = 'test-secret-with-more-than-thirty-two-characters'
process.env.AI_PROVIDER = 'mock'

let server
let baseUrl

before(async () => {
  const { default: app } = await import('../src/app.js')
  server = app.listen(0)
  await new Promise((resolve) => server.once('listening', resolve))
  baseUrl = `http://127.0.0.1:${server.address().port}`
})

after(async () => {
  await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()))
})

test('health endpoint returns a ready response', async () => {
  const response = await fetch(`${baseUrl}/api/health`)
  assert.equal(response.status, 200)
  assert.deepEqual(await response.json(), { data: { status: 'ok' } })
})

test('database connection requires the MONGO_URI environment variable', async () => {
  const previousUri = process.env.MONGO_URI
  delete process.env.MONGO_URI

  try {
    const { connectToDatabase } = await import('../src/config/db.js')
    await assert.rejects(connectToDatabase(), /MONGO_URI is required/)
  } finally {
    if (previousUri === undefined) delete process.env.MONGO_URI
    else process.env.MONGO_URI = previousUri
  }
})

test('public scenarios list contains the five supported scenarios', async () => {
  const response = await fetch(`${baseUrl}/api/scenarios`)
  const result = await response.json()
  assert.equal(response.status, 200)
  assert.deepEqual(result.data.map((scenario) => scenario.id), [
    'transport', 'shopping', 'healthcare', 'education', 'workplace',
  ])
})

test('personal data routes reject requests without a session', async () => {
  for (const endpoint of [
    '/api/auth/me',
    '/api/favorites',
    '/api/progress',
    '/api/progress/lessons',
    '/api/progress/lessons/current',
    '/api/progress/lessons/greetings/attempts',
  ]) {
    const response = await fetch(`${baseUrl}${endpoint}`)
    assert.equal(response.status, 401, `${endpoint} should require authentication`)
  }
})

test('all favorites mutation routes reject requests without a session', async () => {
  const addResponse = await fetch(`${baseUrl}/api/favorites`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phraseId: '507f1f77bcf86cd799439012' }),
  })
  const removeResponse = await fetch(`${baseUrl}/api/favorites/507f1f77bcf86cd799439012`, {
    method: 'DELETE',
  })
  assert.equal(addResponse.status, 401)
  assert.equal(removeResponse.status, 401)
})

test('supplementary lesson generation requires an authenticated session', async () => {
  const response = await fetch(`${baseUrl}/api/lessons/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ topic: 'Weather' }),
  })
  assert.equal(response.status, 401)
})

test('phrase generation requires an authenticated session', async () => {
  const response = await fetch(`${baseUrl}/api/phrases/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ scenarioId: 'shopping' }),
  })
  assert.equal(response.status, 401)
})

test('phrase endpoint validates scenario filters before querying MongoDB', async () => {
  const response = await fetch(`${baseUrl}/api/phrases?scenario=unknown`)
  const result = await response.json()
  assert.equal(response.status, 400)
  assert.match(result.error.message, /supported scenario/i)
})

test('practice input cannot bypass authentication', async () => {
  const response = await fetch(`${baseUrl}/api/practice/respond`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ scenario: 'shopping', message: 'ಇದು ಎಷ್ಟು?' }),
  })
  assert.equal(response.status, 401)
})

test('TTS endpoint is no longer available', async () => {
  const response = await fetch(`${baseUrl}/api/tts/synthesize`, { method: 'POST' })
  assert.equal(response.status, 404)
})

test('signup validates fields before touching the database', async () => {
  const response = await fetch(`${baseUrl}/api/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'A', email: 'not-an-email', password: 'short' }),
  })
  assert.equal(response.status, 400)
})

test('malformed and oversized JSON request bodies receive safe client errors', async () => {
  const malformedResponse = await fetch(`${baseUrl}/api/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: '{',
  })
  assert.equal(malformedResponse.status, 400)
  assert.match((await malformedResponse.json()).error.message, /valid JSON/i)

  const oversizedResponse = await fetch(`${baseUrl}/api/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ padding: 'x'.repeat(33 * 1024) }),
  })
  assert.equal(oversizedResponse.status, 413)
  assert.match((await oversizedResponse.json()).error.message, /too large/i)
})

test('authentication endpoints apply the configured rate limit', async () => {
  let limited = false
  for (let attempt = 0; attempt < 25; attempt += 1) {
    const response = await fetch(`${baseUrl}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'A', email: 'not-an-email', password: 'short' }),
    })
    if (response.status === 429) {
      limited = true
      break
    }
    assert.equal(response.status, 400)
  }
  assert.equal(limited, true)
})

test('state-changing requests reject an unexpected browser origin', async () => {
  const response = await fetch(`${baseUrl}/api/auth/logout`, {
    method: 'POST',
    headers: { Origin: 'https://other.example' },
  })
  assert.equal(response.status, 403)
})

test('CORS allows credentialed requests only from the configured client origin', async () => {
  const allowedResponse = await fetch(`${baseUrl}/api/health`, {
    headers: { Origin: process.env.CLIENT_URL },
  })
  assert.equal(allowedResponse.headers.get('access-control-allow-origin'), process.env.CLIENT_URL)
  assert.equal(allowedResponse.headers.get('access-control-allow-credentials'), 'true')

  const deniedResponse = await fetch(`${baseUrl}/api/health`, {
    headers: { Origin: 'https://other.example' },
  })
  assert.equal(deniedResponse.status, 403)
})

test('logout clears the HTTP-only session cookie even if the cookie is invalid', async () => {
  const response = await fetch(`${baseUrl}/api/auth/logout`, { method: 'POST' })
  assert.equal(response.status, 200)
  assert.match(response.headers.get('set-cookie'), /erne_session=;/)
  assert.match(response.headers.get('set-cookie'), /HttpOnly/i)
})

test('user JSON responses never include the password hash or token version', async () => {
  const { default: User } = await import('../src/models/User.js')
  const user = new User({ name: 'Test Learner', email: 'learner@example.com', passwordHash: 'secret-hash' })
  const safeProfile = user.toJSON()
  assert.equal(safeProfile.name, 'Test Learner')
  assert.equal(Object.hasOwn(safeProfile, 'passwordHash'), false)
  assert.equal(Object.hasOwn(safeProfile, 'tokenVersion'), false)
})

test('mock practice mode returns a predictable response shape', async () => {
  const { getPracticeReply } = await import('../src/services/aiService.js')
  const reply = await getPracticeReply({ scenario: 'shopping', history: [], message: 'ಇದು ಎಷ್ಟು?' })
  assert.equal(reply.mode, 'mock')
  assert.equal(typeof reply.kannada, 'string')
  assert.equal(typeof reply.transliteration, 'string')
  assert.equal(typeof reply.english, 'string')
  assert.ok(Array.isArray(reply.suggestions))
})
