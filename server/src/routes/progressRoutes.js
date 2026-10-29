import { Router } from 'express'
import {
  getLessonProgress,
  getProgress,
  setCurrentLesson,
  submitLessonAttempt,
  updateProgress,
} from '../controllers/progressController.js'
import { asyncHandler } from '../middleware/errorHandler.js'
import { requireAuth } from '../middleware/requireAuth.js'

const router = Router()

router.use(requireAuth)
router.get('/', asyncHandler(getProgress))
router.put('/', asyncHandler(updateProgress))
router.get('/lessons', asyncHandler(getLessonProgress))
router.put('/lessons/current', asyncHandler(setCurrentLesson))
router.post('/lessons/:lessonId/attempts', asyncHandler(submitLessonAttempt))

export default router
