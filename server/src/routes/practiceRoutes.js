import { Router } from 'express'
import rateLimit from 'express-rate-limit'
import { respond } from '../controllers/practiceController.js'
import { asyncHandler } from '../middleware/errorHandler.js'
import { requireAuth } from '../middleware/requireAuth.js'

const router = Router()
const practiceLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 12,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  handler: (_request, response) => response.status(429).json({ error: { message: 'Practice is temporarily rate limited. Try again shortly.' } }),
})

router.post('/respond', requireAuth, practiceLimiter, asyncHandler(respond))

export default router
