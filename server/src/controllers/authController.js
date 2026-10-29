import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import { HttpError } from '../middleware/errorHandler.js'
import { getSessionSettings } from '../config/session.js'

const cookieName = 'erne_session'

function cookieOptions() {
  const { maxAge } = getSessionSettings()
  return {
    httpOnly: true,
    secure: process.env.COOKIE_SECURE === 'true' || process.env.NODE_ENV === 'production',
    sameSite: process.env.COOKIE_SAME_SITE || 'lax',
    maxAge,
    path: '/',
  }
}

function createSession(response, user) {
  const { expiresIn } = getSessionSettings()
  const token = jwt.sign(
    { sub: user.id, tokenVersion: user.tokenVersion ?? 0 },
    process.env.JWT_SECRET,
    { expiresIn },
  )
  response.cookie(cookieName, token, cookieOptions())
}

export async function signup(request, response) {
  const { name, email, password } = request.body
  if (typeof name !== 'string' || name.trim().length < 2 || name.trim().length > 80) {
    throw new HttpError(400, 'Name must be between 2 and 80 characters.')
  }
  if (typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
    throw new HttpError(400, 'Enter a valid email address.')
  }
  if (typeof password !== 'string' || password.length < 8 || Buffer.byteLength(password, 'utf8') > 72) {
    throw new HttpError(400, 'Password must be between 8 and 72 characters.')
  }

  const normalizedEmail = email.trim().toLowerCase()
  if (await User.exists({ email: normalizedEmail })) throw new HttpError(409, 'An account already exists for that email.')

  const passwordHash = await bcrypt.hash(password, 12)
  let user
  try {
    user = await User.create({ name: name.trim(), email: normalizedEmail, passwordHash })
  } catch (error) {
    if (error.code === 11000) throw new HttpError(409, 'An account already exists for that email.')
    throw error
  }
  createSession(response, user)
  response.status(201).json({ data: { user: user.toJSON() } })
}

export async function login(request, response) {
  const { email, password } = request.body
  if (typeof email !== 'string' || typeof password !== 'string' || Buffer.byteLength(password, 'utf8') > 72) {
    throw new HttpError(400, 'Enter a valid email and password.')
  }

  const user = await User.findOne({ email: email.trim().toLowerCase() }).select('+passwordHash +tokenVersion')
  const passwordMatches = user ? await bcrypt.compare(password, user.passwordHash) : false
  if (!passwordMatches) throw new HttpError(401, 'Email or password is incorrect.')

  createSession(response, user)
  response.json({ data: { user: user.toJSON() } })
}

export async function logout(request, response) {
  const token = request.cookies.erne_session
  let payload
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET)
      payload = typeof decoded === 'object' ? decoded : null
    } catch {
      payload = null
    }
  }
  if (payload?.sub) await User.updateOne({ _id: payload.sub }, { $inc: { tokenVersion: 1 } })
  const { maxAge: _maxAge, ...clearOptions } = cookieOptions()
  response.clearCookie(cookieName, clearOptions)
  response.json({ data: { loggedOut: true } })
}

export function currentUser(request, response) {
  response.json({ data: { user: request.user.toJSON() } })
}

export async function updateProfile(request, response) {
  const { preferredLearningLevel } = request.body
  if (!['beginner', 'intermediate', 'advanced'].includes(preferredLearningLevel)) {
    throw new HttpError(400, 'Choose a supported learning level.')
  }
  request.user.preferredLearningLevel = preferredLearningLevel
  await request.user.save()
  response.json({ data: { user: request.user.toJSON() } })
}
