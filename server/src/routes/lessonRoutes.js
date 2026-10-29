import { Router } from 'express'
import rateLimit from 'express-rate-limit'
import { generateSupplementaryLesson, getSupplementaryLesson } from '../controllers/lessonController.js'
import { asyncHandler } from '../middleware/errorHandler.js'
import { requireAuth } from '../middleware/requireAuth.js'
import { validateObjectId } from '../middleware/validateObjectId.js'

const router = Router()
const generationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  handler: (_request, response) => response.status(429).json({
    error: { message: 'Supplementary lesson generation is temporarily rate limited. Try again later.' },
  }),
})

router.post('/generate', requireAuth, generationLimiter, asyncHandler(generateSupplementaryLesson))
router.get('/supplementary/:lessonId', requireAuth, validateObjectId('lessonId'), asyncHandler(getSupplementaryLesson))

export default router
