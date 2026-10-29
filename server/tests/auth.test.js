import { after, before, test } from 'node:test'
import assert from 'node:assert/strict'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

process.env.CLIENT_URL = 'http://localhost:5173'
process.env.JWT_SECRET = 'test-secret-with-more-than-thirty-two-characters'
process.env.JWT_EXPIRES_IN = '2h'
process.env.COOKIE_SAME_SITE = 'lax'
process.env.NODE_ENV = 'test'
process.env.AI_PROVIDER = 'mock'

const userId = '507f1f77bcf86cd799439011'
let server
let baseUrl
let storedUser
let originalMethods

before(async () => {
  const [{ default: app }, { default: User }] = await Promise.all([
    import('../src/app.js'),
    import('../src/models/User.js'),
  ])
  originalMethods = {
    exists: User.exists,
    create: User.create,
    findOne: User.findOne,
    findById: User.findById,
    updateOne: User.updateOne,
  }

  User.exists = async () => null
  User.create = async (profile) => {
    storedUser = {
      id: userId,
      _id: userId,
      name: profile.name,
      email: profile.email,
      passwordHash: profile.passwordHash,
      preferredLearningLevel: profile.preferredLearningLevel ?? 'beginner',
      tokenVersion: 0,
      async save() { return this },
      toJSON() {
        return {
          id: this.id,
          name: this.name,
          email: this.email,
          preferredLearningLevel: this.preferredLearningLevel,
        }
      },
    }
    return storedUser
  }
  User.findOne = () => ({ select: async () => storedUser })
  User.findById = () => ({ select: async () => storedUser })
  User.updateOne = async () => {
    storedUser.tokenVersion += 1
  }

  server = app.listen(0)
  await new Promise((resolve) => server.once('listening', resolve))
  baseUrl = `http://127.0.0.1:${server.address().port}`
})

after(async () => {
  const { default: User } = await import('../src/models/User.js')
  Object.assign(User, originalMethods)
  await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()))
})

function sessionCookie(response) {
  return response.headers.get('set-cookie')?.split(';', 1)[0]
}

test('signup hashes passwords and issues a timed HTTP-only JWT cookie', async () => {
  const response = await fetch(`${baseUrl}/api/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Test Learner', email: 'learner@example.com', password: 'a-private-password' }),
  })
  const body = await response.json()
  const cookie = response.headers.get('set-cookie')
  const token = sessionCookie(response)?.split('=').slice(1).join('=')

  assert.equal(response.status, 201)
  assert.equal(body.data.user.email, 'learner@example.com')
  assert.equal(Object.hasOwn(body.data.user, 'passwordHash'), false)
  assert.equal(await bcrypt.compare('a-private-password', storedUser.passwordHash), true)
  assert.notEqual(storedUser.passwordHash, 'a-private-password')
  assert.match(cookie, /HttpOnly/i)
  assert.match(cookie, /SameSite=Lax/i)
  assert.match(cookie, /Max-Age=7200/i)
  assert.doesNotMatch(cookie, /Secure/i)

  const claims = jwt.verify(token, process.env.JWT_SECRET)
  assert.equal(claims.sub, userId)
  assert.equal(claims.exp - claims.iat, 7200)
})

test('login rejects invalid passwords and restores a valid cookie session', async () => {
  const invalidResponse = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'learner@example.com', password: 'wrong-password' }),
  })
  assert.equal(invalidResponse.status, 401)

  process.env.NODE_ENV = 'production'
  let loginResponse
  try {
    loginResponse = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'learner@example.com', password: 'a-private-password' }),
    })
  } finally {
    process.env.NODE_ENV = 'test'
  }
  const cookie = sessionCookie(loginResponse)
  assert.equal(loginResponse.status, 200)
  assert.ok(cookie)
  assert.match(loginResponse.headers.get('set-cookie'), /Secure/i)

  const currentUserResponse = await fetch(`${baseUrl}/api/auth/me`, {
    headers: { Cookie: cookie },
  })
  const currentUserBody = await currentUserResponse.json()
  assert.equal(currentUserResponse.status, 200)
  assert.equal(currentUserBody.data.user.id, userId)
  assert.equal(Object.hasOwn(currentUserBody.data.user, 'passwordHash'), false)
  assert.equal(Object.hasOwn(currentUserBody.data.user, 'tokenVersion'), false)
})

test('protected routes distinguish missing, invalid, and expired sessions', async () => {
  const missingResponse = await fetch(`${baseUrl}/api/auth/me`)
  assert.equal(missingResponse.status, 401)
  assert.match((await missingResponse.json()).error.message, /log in/i)

  const invalidResponse = await fetch(`${baseUrl}/api/auth/me`, {
    headers: { Cookie: 'erne_session=not-a-jwt' },
  })

  test('profile learning level is validated, saved to the session owner, and returned after refresh', async () => {
    const loginResponse = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'learner@example.com', password: 'a-private-password' }),
    })
    const cookie = sessionCookie(loginResponse)

    const invalidResponse = await fetch(`${baseUrl}/api/auth/me`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Cookie: cookie },
      body: JSON.stringify({ preferredLearningLevel: 'expert', userId: '507f1f77bcf86cd799439099' }),
    })
    assert.equal(invalidResponse.status, 400)

    const updateResponse = await fetch(`${baseUrl}/api/auth/me`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Cookie: cookie },
      body: JSON.stringify({ preferredLearningLevel: 'advanced', userId: '507f1f77bcf86cd799439099' }),
    })
    const updatedUser = await updateResponse.json()
    assert.equal(updateResponse.status, 200)
    assert.equal(updatedUser.data.user.id, userId)
    assert.equal(updatedUser.data.user.preferredLearningLevel, 'advanced')
    assert.equal(storedUser.preferredLearningLevel, 'advanced')

    const refreshedResponse = await fetch(`${baseUrl}/api/auth/me`, { headers: { Cookie: cookie } })
    assert.equal((await refreshedResponse.json()).data.user.preferredLearningLevel, 'advanced')
  })
  assert.equal(invalidResponse.status, 401)
  assert.match((await invalidResponse.json()).error.message, /invalid/i)

  const expiredToken = jwt.sign({ sub: userId, tokenVersion: storedUser.tokenVersion }, process.env.JWT_SECRET, { expiresIn: -1 })
  const expiredResponse = await fetch(`${baseUrl}/api/auth/me`, {
    headers: { Cookie: `erne_session=${expiredToken}` },
  })
  assert.equal(expiredResponse.status, 401)
  assert.match((await expiredResponse.json()).error.message, /expired/i)
})

test('logout clears the cookie and revokes the existing session', async () => {
  const loginResponse = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'learner@example.com', password: 'a-private-password' }),
  })
  const cookie = sessionCookie(loginResponse)

  const logoutResponse = await fetch(`${baseUrl}/api/auth/logout`, {
    method: 'POST',
    headers: { Cookie: cookie },
  })
  assert.equal(logoutResponse.status, 200)
  assert.match(logoutResponse.headers.get('set-cookie'), /erne_session=;/)
  assert.match(logoutResponse.headers.get('set-cookie'), /HttpOnly/i)

  const oldSessionResponse = await fetch(`${baseUrl}/api/auth/me`, {
    headers: { Cookie: cookie },
  })
  assert.equal(oldSessionResponse.status, 401)
  assert.match((await oldSessionResponse.json()).error.message, /no longer valid/i)
})

test('authenticated practice endpoint enforces its request rate limit', async () => {
  const loginResponse = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'learner@example.com', password: 'a-private-password' }),
  })
  const cookie = sessionCookie(loginResponse)

  for (let attempt = 0; attempt < 12; attempt += 1) {
    const response = await fetch(`${baseUrl}/api/practice/respond`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: cookie },
      body: JSON.stringify({ scenario: 'shopping', message: 'ಇದು ಎಷ್ಟು?', history: [] }),
    })
    assert.equal(response.status, 200)
    const result = await response.json()
    assert.equal(result.data.mode, 'mock')
    assert.equal(typeof result.data.kannada, 'string')
  }

  const limitedResponse = await fetch(`${baseUrl}/api/practice/respond`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: cookie },
    body: JSON.stringify({ scenario: 'shopping', message: 'ಇದು ಎಷ್ಟು?', history: [] }),
  })
  assert.equal(limitedResponse.status, 429)
})
