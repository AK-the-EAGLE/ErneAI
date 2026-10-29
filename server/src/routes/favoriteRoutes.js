import { Router } from 'express'
import { addFavorite, listFavorites, removeFavorite } from '../controllers/favoriteController.js'
import { asyncHandler } from '../middleware/errorHandler.js'
import { requireAuth } from '../middleware/requireAuth.js'
import { validateObjectId } from '../middleware/validateObjectId.js'

const router = Router()

router.use(requireAuth)
router.get('/', asyncHandler(listFavorites))
router.post('/', asyncHandler(addFavorite))
router.delete('/:favoriteId', validateObjectId('favoriteId'), asyncHandler(removeFavorite))

export default router
