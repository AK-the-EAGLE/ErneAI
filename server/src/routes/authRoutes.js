import { Router } from 'express'
import rateLimit from 'express-rate-limit'
import { currentUser, login, logout, signup, updateProfile } from '../controllers/authController.js'
import { requireAuth } from '../middleware/requireAuth.js'
import { asyncHandler } from '../middleware/errorHandler.js'

const router = Router()
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  handler: (_request, response) => response.status(429).json({ error: { message: 'Too many authentication attempts. Try again later.' } }),
})

router.post('/signup', authLimiter, asyncHandler(signup))
router.post('/login', authLimiter, asyncHandler(login))
router.post('/logout', asyncHandler(logout))
router.get('/me', requireAuth, currentUser)
router.patch('/me', requireAuth, asyncHandler(updateProfile))

export default router
