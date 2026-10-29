import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import { asyncHandler, HttpError } from './errorHandler.js'

export const requireAuth = asyncHandler(async (request, _response, next) => {
  const token = request.cookies.erne_session
  if (!token) throw new HttpError(401, 'Please log in to continue.')

  let payload
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET)
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new HttpError(401, 'Your session has expired. Please log in again.')
    }
    throw new HttpError(401, 'Your session is invalid. Please log in again.')
  }

  if (typeof payload !== 'object' || typeof payload.sub !== 'string' || !/^[a-f\d]{24}$/i.test(payload.sub)) {
    throw new HttpError(401, 'Your session is invalid. Please log in again.')
  }

  const user = await User.findById(payload.sub).select('+tokenVersion')
  if (!user) throw new HttpError(401, 'Your session is no longer valid. Please log in again.')
  if (payload.tokenVersion !== user.tokenVersion) throw new HttpError(401, 'Your session is no longer valid. Please log in again.')
  request.user = user
  next()
})
