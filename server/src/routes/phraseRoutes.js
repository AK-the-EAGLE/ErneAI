import { Router } from 'express'
import rateLimit from 'express-rate-limit'
import { generatePhrases, getPhrase, listPhrases } from '../controllers/phraseController.js'
import { asyncHandler } from '../middleware/errorHandler.js'
import { requireAuth } from '../middleware/requireAuth.js'
import { validateObjectId } from '../middleware/validateObjectId.js'

const router = Router()
const generationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  handler: (_request, response) => response.status(429).json({
    error: { message: 'Phrase generation is temporarily rate limited. Try again later.' },
  }),
})

router.post('/generate', requireAuth, generationLimiter, asyncHandler(generatePhrases))
router.get('/', asyncHandler(listPhrases))
router.get('/:id', validateObjectId(), asyncHandler(getPhrase))

export default router
