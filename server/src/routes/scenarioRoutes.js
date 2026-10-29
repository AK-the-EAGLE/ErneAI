import { Router } from 'express'
import { scenarios } from '../config/scenarios.js'

const router = Router()

router.get('/', (_request, response) => response.json({ data: scenarios }))

export default router
